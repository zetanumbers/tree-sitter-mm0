["(" ")" "{" "}" "[" "]" "$"] @punctuation.bracket

["pure" "strict" "provable" "free" "pub" "local"] @keyword.storage.modifier
"sort" @keyword.storage

"do" @keyword
"import" @keyword.control.import
["term" "axiom" "theorem" "def" "fn"] @keyword.function
["delimiter" "infixl" "infixr" "prefix" "coercion" "notation"] @keyword.control
"prec" @keyword.operator
"max" @constant.builtin
"fn" @keyword.function
["begin" "quote" "unquote" "focus" "set-merge-strategy"] @keyword
["let" "letrec"] @keyword.storage.type
["if" "match" "match-fn" "match-fn*"] @keyword.control.conditional

(undef) @constant.builtin
(bool) @constant.builtin.boolean

(sort_stmt name: (identifier) @type.enum)
(decl_stmt name: (identifier) @function)
(gen_notation_stmt name: (identifier) @function)
(simple_notation_stmt name: (identifier) @function)
(coercion_stmt name: (identifier) @function)
(coercion_stmt left_sort: (identifier) @type.enum)
(coercion_stmt right_sort: (identifier) @type.enum)

(var_decl (identifier) @variable.parameter)

(type sort_name: (identifier) @type.enum)

(arrow_type ">" @operator)
(decl_stmt "=" @operator)
(gen_notation_stmt "=" @operator)

(math_token/identifier) @function (#is-not? local)

(number) @constant.numeric

(list_inner/list_inner_other head: (sexpr/atom_identifier) @function)
(list_inner/list_inner_other head: (sexpr/atom_arrow_identifier) @function)
(list_inner/def_inner name: (atom_identifier) @function)
(list_inner/def_inner name: (atom_arrow_identifier) @function)

(s_var_decl (atom_identifier) @variable.parameter)

(comment) @comment
