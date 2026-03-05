["pure" "strict" "provable" "free"] @keyword.storage.modifier
"sort" @keyword.storage

["term" "axiom" "theorem" "def"] @keyword
["delimiter" "infixl" "infixr" "prefix" "coercion" "notation"] @keyword.directive
"prec" @keyword.operator
"max" @constant.builtin

(sort_stmt name: (identifier) @type.enum)
(term_stmt name: (identifier) @type.enum.variant)
(assert_stmt name: (identifier) @function)
(def_stmt name: (identifier) @function)
(gen_notation_stmt name: (identifier) @function)
(simple_notation_stmt name: (identifier) @function)
(coercion_stmt name: (identifier) @function)
(coercion_stmt left_sort: (identifier) @type.enum)
(coercion_stmt right_sort: (identifier) @type.enum)

(argument_list (identifier) @variable.parameter)
(dummy_argument_list (identifier) @variable.parameter)

(type sort_name: (identifier) @type.enum)

(arrow_type ">" @operator)
(formula_arrow_type ">" @operator)
(def_stmt "=" @operator)
(gen_notation_stmt "=" @operator)

(math_token (identifier) @function (#is-not? local))
[(other_math_token) (unbalanced_math_lexeme)] @operator
(math_token ["(" ")"] @operator)

(number) @constant.numeric

(comment) @comment
