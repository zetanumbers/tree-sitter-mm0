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
      $.sort_stmt,
      $.term_stmt,
      $.assert_stmt,
      $.def_stmt,
      $.notation_stmt,
      $.inout_stmt
    ),

    sort_stmt: $ => seq(
      optional('pure'), optional('strict'), optional('provable'), optional('free'),
      'sort', field('name', $.identifier), ';'
    ),

    term_stmt: $ => seq('term', field('name', $.identifier), repeat($.type_binder), ':', $.arrow_type, ';'),
    type: $ => seq(field('sort_name', $.identifier), optional($.type_variables)),
    type_binder: $ => choice(
      seq('{', field('arguments', $.argument_list), ':', $.type, '}'),
      seq('(', field('arguments', $.argument_list), ':', $.type, ')')
    ),
    arrow_type: $ => choice($.type, seq($.type, '>', $.arrow_type)),
    type_variables: $ => repeat1($.identifier),

    assert_stmt: $ => seq(
      choice('axiom', 'theorem'),
      field('name', $.identifier),
      repeat($.formula_type_binder), ':',
      $.formula_arrow_type, ';'
    ),
    formula_type_binder: $ => choice(
      seq('{', field('arguments', $.argument_list), ':', $.type, '}'),
      seq('(', field('arguments', $.argument_list), ':', choice($.type, $.formula), ')')),
    formula_arrow_type: $ => choice(
      $.formula,
      seq(choice($.type, $.formula), '>', $.formula_arrow_type)
    ),
    formula: $ => $.math_string,

    def_stmt: $ => seq('def', field('name', $.identifier), repeat($.dummy_binder), ':',
      $.type, optional(seq('=', $.formula)), ';'),
    dummy_binder: $ => choice(
      seq('{', field('arguments', $.dummy_argument_list), ':', $.type, '}'),
      seq('(', field('arguments', $.dummy_argument_list), ':', $.type, ')')
    ),
    dummy_argument_list: $ => repeat1(seq(optional('.'), $.identifier)),

    notation_stmt: $ => 'notation',
    inout_stmt: $ => 'inout',

    argument_list: $ => repeat1($.identifier),

    math_string: $ => seq('$', repeat($.math_token), '$'),
    math_token: $ => choice(
      prec(4, $.identifier),
      prec(3, $.number),
      prec(2, $.math_bang_token),
      prec(1, seq('(', repeat($.math_token), ')')),
      /[^a-zA-Z_\$\(\)]/
    ),
    math_bang_token: $ => seq('(', '!', repeat($.math_token), ')'),

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
