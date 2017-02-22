""" Create hymnes et louanges dictionary from text."""

import codecs
import json
import unicodedata

def processHymnText(index, filename, from_encoding, to_encoding="utf-8"):
  with codecs.open(filename, 'r', from_encoding) as file:
    lines = file.read().splitlines() 

    output = ""
    for line in lines:
      line = line.encode(to_encoding)
      line = line.strip()
      if ("(bis)" in line or "{2 fois" in line):
        line = line.replace("(bis)", "")
        line = line.replace("{2 fois", "")
        line = line + " (2x)"
      if ("(ter)" in line):
        line = line.replace("(ter)", "")
        line = line + " (3x)"
      output += line + "\n"

    with codecs.open(filename.replace("original", "generated"), "w") as outifle:
      outifle.write(output)


def CreateHymnObject(index, filename):
  with codecs.open(filename, 'r') as file:
    lines = file.read().splitlines() 

    hymn = {}
    hymn["number"] = index
    hymn["title"] = lines[1][6:]
    hymn["parts"] = []
    hymn["slides"] = []
    
    part = ''
    hasRefrain, final = (False, False)

    # Starts at line 2 since line 1 is empty
    for line in lines[2:]:
      if line:
        refrain = line.lower() == "refrain"
        final = line.lower() == "final"
        choeur = line.lower() == "choeur"

        # Add part header (paragraph number or title)
        if len(line) < 3 or refrain or final or choeur:
          part = line.lower()
          if hasRefrain and refrain:
            final = True

          if hasRefrain:
            hymn["slides"].append("refrain")
          if refrain:
            hasRefrain = True
          if final:
            refrain = False
            part = "fin"
            del hymn["slides"][-1]
          if choeur:
            suffix = len([x for x in hymn["parts"] if x.startswith('Choeur')])
            part = 'Choeur_%s' % str(suffix + 1)
          
          hymn[part] = []
          hymn["parts"].append(part)
          if not refrain:
            hymn["slides"].append(part)  

        else:
          hymn[part].append(line)

    # Add refrain after last stanza
    if hasRefrain and len(hymn["slides"])%2 == 1:
      hymn["slides"].append("refrain")
    return hymn


hymns = []
for index in range(1, 655):
  prefix = 'H' + str(index) if index > 99 else 'H0' + str(index) 
  if index < 10:
    prefix = 'H00' + str(index)
  processHymnText(index, 'hymns/original/' + prefix + '.txt', 'ISO-8859-1')
  hymn = CreateHymnObject(index, 'hymns/generated/' + prefix + '.txt')
  hymns.append(hymn)

with codecs.open("json/hymns.json", "w") as outifle:
  outifle.write(json.dumps(hymns))
