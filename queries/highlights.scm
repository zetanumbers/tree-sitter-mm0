"pure" @keyword
"strict" @keyword
"provable" @keyword
"free" @keyword
"sort" @keyword.storage
"term" @keyword
"axiom" @keyword
"theorem" @keyword

(sort_stmt name: (identifier) @type)
(term_stmt name: (identifier) @constructor)
(assert_stmt name: (identifier) @function)

(argument_list (identifier) @variable.parameter)

(type sort_name: (identifier) @type)

(arrow_type ">" @operator)
(formula_arrow_type ">" @operator)

(comment) @comment
