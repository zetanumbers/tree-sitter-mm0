";" @punctuation.delimiter

"(" @punctuation.bracket
")" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket

"pure" @keyword
"strict" @keyword
"provable" @keyword
"free" @keyword
"sort" @keyword
"term" @keyword

(sort_stmt name: (identifier) @type)
(term_stmt name: (identifier) @constructor)

(variable_list (identifier) @variable.parameter)

(type) @type

(comment) @comment
