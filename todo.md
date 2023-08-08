# Todo
- Add better interface, perhaps OCR tessaract js, autclicking with robotjs
- Better best move chosing algorithm, perhaps max probability of selecting all 2s or 3s without selecting any voltorbs accross a pruned tree of selections.
top x
get next moves from top x and evaluate combined probability
top x 


should just be moves that minimize probability of loss while pruning moves that don't give information

any 100% 2 or 3s should go first
any 100% voltorbs should be discarded