(decl_stmt) @local.scope
(gen_notation_stmt) @local.scope
(var_decl (identifier) @local.definition.variable.parameter)
(identifier) @local.reference

(def_inner) @local.scope
(fn_inner) @local.scope
(s_var_decl (atom_identifier) @local.definition.variable.parameter)
(atom_identifier) @local.reference
