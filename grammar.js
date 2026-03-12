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

  rules: {
    source_file: $ => repeat($.statement),

    statement: $ => choice(
      $.decl_stmt,
      $.def_stmt,
      $.notation_stmt,
      $.inout_stmt
    ),

    sort_stmt: $ => seq(
      optional('pure'), optional('strict'), optional('provable'), optional('free'),
      'sort', field('name', $.identifier), ';',
    ),


    decl_stmt: $ => seq(
      optional($.visibility), $.decl_kind, $.identifier, repeat(seq($.binder)),
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

    do_stmt: $ => seq('do', choice(seq('{', repeat($.sexpr), '}'), $.sexpr), ';'),

    sexpr: $ => choice($.atom, $.list, $.number, $.string, $.bool, '#undef', $.formula, seq("'", $.sexpr), seq(',', $.sexpr)),
    atom: $ => choice(seq($.initial, repeat($.subsequent)), '+', '-', '...', seq('->', repeat($.subsequent))),
    initial: $ =>    [a-z] | [A-Z] |         [!%&*/:<=>?^_~]
    subsequent: $ => [a-z] | [A-Z] | [0-9] | [!%&*/:<=>?^_~+-.@]
    list: $ => '(' list_inner ')' | '[' list_inner ']'
    list_inner: $ => (sexpr)* | (sexpr)+ '.' sexpr
    number: $ => [0-9]+ | 0[xX][0-9a-fA-F]+
    string: $ => '"' (char)* '"'
    char: $ => <any character other than " and \ > | '\"' | '\\' | '\n' | '\r'
    bool: $ => choice('#t', '#f'),

    term_stmt: $ => seq('term', field('name', $.identifier), repeat($.type_binder), ':', $.arrow_type, ';'),
    type: $ => seq(field('sort_name', $.identifier), optional($.type_variables)),
    type_binder: $ => choice(
      seq('{', field('arguments', $.argument_list), ':', $.type, '}'),
      seq('(', field('arguments', $.argument_list), ':', $.type, ')'),
    ),
    arrow_type: $ => choice($.type, seq($.type, '>', $.arrow_type)),
    type_variables: $ => repeat1($.identifier),

    assert_stmt: $ => seq(
      choice('axiom', 'theorem'),
      field('name', $.identifier),
      repeat($.formula_type_binder), ':',
      $.formula_arrow_type, ';',
    ),
    formula_type_binder: $ => choice(
      seq('{', field('arguments', $.argument_list), ':', $.type, '}'),
      seq('(', field('arguments', $.argument_list), ':', choice($.type, $.formula), ')'),
    ),
    formula_arrow_type: $ => choice(
      $.formula,
      seq(choice($.type, $.formula), '>', $.formula_arrow_type),
    ),
    formula: $ => $.math_string,

    def_stmt: $ => seq('def', field('name', $.identifier), repeat($.dummy_binder), ':',
      $.type, optional(seq('=', $.formula)), ';'),
    dummy_binder: $ => choice(
      seq('{', field('arguments', $.dummy_argument_list), ':', $.type, '}'),
      seq('(', field('arguments', $.dummy_argument_list), ':', $.type, ')'),
    ),
    dummy_argument_list: $ => repeat1(seq(optional('.'), $.identifier)),

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
    constant: $ => $.math_string,
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
    gen_notation_stmt: $ => seq('notation', field('name', $.identifier), repeat($.type_binder), ':', $.type, '=', $.prec_constant, repeat($.notation_literal), ';'),
    notation_literal: $ => choice($.prec_constant, $.identifier),
    prec_constant: $ => seq('(', $.constant, ':', $.precedence_lvl, ')'),

    inout_stmt: $ => choice($.input_stmt, $.output_stmt),
    input_stmt: $ => seq('input', $.input_kind, ':', repeat(choice($.identifier, $.math_string)), ';'),
    output_stmt: $ => seq('output', $.output_kind, ':', repeat(choice($.identifier, $.math_string)), ';'),
    input_kind: $ => $.identifier,
    output_kind: $ => $.identifier,

    argument_list: $ => repeat1($.identifier),

    unbalanced_math_string: $ => seq('$', repeat($.unbalanced_math_lexeme), '$'),
    unbalanced_math_lexeme: $ => /[^a-zA-Z\d\s\$]/,

    math_string: $ => seq('$', repeat($.math_token), '$'),
    math_token: $ => choice(
      prec(3, $.identifier),
      prec(2, $.number),
      prec(1, seq('(', repeat($.math_token), ')')),
      $.other_math_token,
    ),
    other_math_token: $ => /[^a-zA-Z\d\s_\$\(\)]+/,

    identifier: $ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,
    number: $ => /\d+/,

    comment: $ => seq(
      '--',
      choice(
        prec(1, seq('|', field('doc', /.*/))),
        /.*/,
      ),
    ),
  }
});
