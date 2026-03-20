/**
 * @file A parser for the Metamath Zero language
 * @author Daria Sukhonina <dariasukhonina@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "metamath_zero",

  extras: $ => [
    /\s/,
    $.comment,
  ],

  supertypes: $ => [
    $.sexpr,
    $.list_inner,
    $.math_token,
  ],

  rules: {
    source_file: $ => repeat($.statement),

    statement: $ => choice(
      $.import_stmt,
      $.sort_stmt,
      $.decl_stmt,
      $.notation_stmt,
      $.inout_stmt,
      $.do_stmt,
      $.annot_stmt,
    ),

    import_stmt: $ => seq('import', /"[^"]*"/, ';'),

    sort_stmt: $ => seq(
      optional('pure'), optional('strict'), optional('provable'), optional('free'),
      'sort', field('name', $.identifier), ';',
    ),

    decl_stmt: $ => seq(
      optional($.visibility), $.decl_kind, field('name', $.identifier), repeat(seq($.binder)),
      optional(seq(':', $.arrow_type)), optional(seq('=', $.sexpr)), ';'
    ),
    visibility: $ => choice('pub', 'abstract', 'local'),
    decl_kind: $ => choice('term', 'axiom', 'def', 'theorem'),
    type_or_fmla: $ => choice($.type, $.formula),
    binder: $ => choice(
      seq('{', repeat(seq($.var_decl)), optional(seq(':', $.type_or_fmla)), '}'),
      seq('(', repeat(seq($.var_decl)), optional(seq(':', $.type_or_fmla)), ')'),
    ),
    var_decl: $ => seq(optional('.'), $.identifier),
    arrow_type: $ => choice($.type_or_fmla, seq($.type_or_fmla, '>', $.arrow_type)),

    annot_stmt: $ => seq('@', $.sexpr, $.statement),
    
    do_stmt: $ => prec(5, seq('do', $.sexpr, ';')),
    s_var_decl: $ => $.atom_identifier,

    sexpr: $ => choice(
      $.atom_identifier,
      $.atom_arrow_identifier,
      $.atom_other,
      $.list,
      $.number,
      $.string,
      $.bool,
      $.undef,
      $.formula,
      $.quote,
      $.unquote,
    ),
    quote: $ => seq("'", $.sexpr),
    unquote: $ => seq(',', $.sexpr),

    atom_other: $ => choice('+', '-', '...'),
    atom_identifier: $ => /[a-zA-Z!%&*/:<=>?\^_~][a-zA-Z0-9!%&*/:<=>?\^_~+\-.@]*/,
    atom_arrow_identifier: $ => /->[a-zA-Z0-9!%&*/:<=>?\^_~+\-.@]*/,
    list: $ => choice(
      seq('(', optional($.list_inner), ')'),
      seq('[', optional($.list_inner), ']'),
      seq('{', optional($.list_inner), '}'),
    ),
    list_inner: $ => choice(prec(1, $.def_inner), prec(1, $.fn_inner), $.list_inner_other),
    list_inner_other: $ => seq(field('head', choice($.list_inner_head_syntax, $.sexpr)), repeat($.sexpr), optional(seq('.', $.sexpr)), optional(seq('@', $.list_inner))),
    list_inner_head_syntax: $ => choice('begin', 'def', 'fn', 'quote', 'unquote', 'if', 'focus', 'let', 'letrec', 'set-merge-strategy', 'match', 'match-fn', 'match-fn*'),

    def_inner: $ => prec(1, seq('def', $._def_inner_binder, repeat($.sexpr), optional(seq('@', $.list_inner)))),
    _def_inner_binder: $ => choice(field('name', choice($.atom_identifier, $.atom_arrow_identifier)), seq('(', $._def_inner_binder, repeat(choice($.s_var_decl, '.')), ')')),
    fn_inner: $ => prec(1, seq('fn', choice($.s_var_decl, seq('(', repeat(choice($.s_var_decl, '.')), ')')), repeat($.sexpr), optional(seq('@', $.list_inner)))),

    number: $ => choice(/[0-9]+/, /0[xX][0-9a-fA-F]+/),
    string: $ => seq('"', repeat($._char), '"'),
    _char: $ => token.immediate(choice(/[^"\\]/, '\\"', '\\\\', '\\n', '\\r')),
    bool: $ => choice('#t', '#f'),
    undef: $ => '#undef',

    type: $ => seq(field('sort_name', $.identifier), optional($.type_variables)),
    type_variables: $ => repeat1($.identifier),
    formula: $ => $.math_string,

    notation_stmt: $ => choice($.delimiter_stmt, $.simple_notation_stmt, $.coercion_stmt, $.gen_notation_stmt),
    delimiter_stmt: $ => seq(
      'delimiter',
      $.unbalanced_math_string,
      optional($.unbalanced_math_string),
      ';',
    ),
    simple_notation_stmt: $ => seq(
      choice('infixl', 'infixr', 'prefix'), field('name', $.identifier), ':',
      $.constant, 'prec', $.precedence_lvl, ';',
    ),
    constant: $ => $.unbalanced_math_string,
    precedence_lvl: $ => choice($.number, 'max'),
    coercion_stmt: $ => seq(
      'coercion',
      field('name', $.identifier),
      ':',
      field('left_sort', $.identifier),
      '>',
      field('right_sort', $.identifier),
      ';',
    ),
    gen_notation_stmt: $ => seq(
      'notation',
      field('name', $.identifier),
      repeat($.binder),
      optional(seq(':', $.type)),
      '=',
      repeat1($.notation_literal),
      optional(seq(':', $.precedence_lvl, choice('lassoc', 'rassoc'))),
      ';'
    ),
    notation_literal: $ => choice($.prec_constant, $.identifier),
    prec_constant: $ => seq('(', $.constant, ':', $.precedence_lvl, ')'),

    inout_stmt: $ => choice($.input_stmt, $.output_stmt),
    input_stmt: $ => seq('input', $.input_kind, ':', repeat(choice($.identifier, $.math_string)), ';'),
    output_stmt: $ => seq('output', $.output_kind, ':', repeat(choice($.identifier, $.math_string)), ';'),
    input_kind: $ => $.identifier,
    output_kind: $ => $.identifier,

    unbalanced_math_string: $ => seq('$', repeat($.unbalanced_math_lexeme), '$'),
    unbalanced_math_lexeme: $ => /[^\s\$]/,

    math_string: $ => seq('$', repeat($.math_token), '$'),
    math_token: $ => choice(
      prec(3, $.identifier),
      prec(2, $.number),
      prec(1, $.math_token_list),
      $.other_math_token,
    ),
    math_token_list: $ => seq('(', repeat($.math_token), ')'),
    other_math_token: $ => /[^a-zA-Z0-9\s_\$\(\)]+/,

    identifier: $ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,
    number: $ => /[0-9]+/,

    comment: $ => seq(
      '--',
      choice(
        prec(1, seq('|', field('doc', /.*/))),
        /.*/,
      ),
    ),
  }
});
