["(" ")" "{" "}" "$"] @punctuation.bracket

["pure" "strict" "provable" "free" "pub" "local"] @keyword.storage.modifier
"sort" @keyword.storage

"import" @keyword.control.import
["term" "axiom" "theorem" "def"] @keyword
["delimiter" "infixl" "infixr" "prefix" "coercion" "notation"] @keyword.control
"prec" @keyword.operator
"max" @constant.builtin

(sort_stmt name: (identifier) @type.enum)
(decl_stmt name: (identifier) @function)
(gen_notation_stmt name: (identifier) @function)
(simple_notation_stmt name: (identifier) @function)
(coercion_stmt name: (identifier) @function)
(coercion_stmt left_sort: (identifier) @type.enum)
(coercion_stmt right_sort: (identifier) @type.enum)

(list_inner head: (sexpr (atom) @function))

(var_decl (identifier) @variable.parameter)

(type sort_name: (identifier) @type.enum)

(arrow_type ">" @operator)
(decl_stmt "=" @operator)
(gen_notation_stmt "=" @operator)

(math_token (identifier) @function (#is-not? local))

(number) @constant.numeric

(comment) @comment
