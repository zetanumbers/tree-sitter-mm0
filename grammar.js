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
    type: $ => repeat1($.identifier),
    type_binder: $ => choice(
      seq('{', field('arguments', $.variable_list), ':', $.type, '}'),
      seq('(', field('arguments', $.variable_list), ':', $.type, ')')
    ),
    arrow_type: $ => choice($.type, seq($.type, '>', $.arrow_type)),

    assert_stmt: $ => seq(
      choice('axiom', 'theorem'),
      field('name', $.identifier),
      repeat($.formula_type_binder), ':',
      $.formula_arrow_type, ';'
    ),
    formula_type_binder: $ => choice(
      seq('{', field('arguments', $.variable_list), ':', $.type, '}'),
      seq('(', field('arguments', $.variable_list), ':', choice($.type, $.formula), ')')),
    formula_arrow_type: $ => choice(
      $.formula,
      seq(choice($.type, $.formula), '>', $.formula_arrow_type)
    ),
    formula: $ => $.math_string,

    def_stmt: $ => 'def',
    notation_stmt: $ => 'notation',
    inout_stmt: $ => 'inout',

    variable_list: $ => repeat1($.identifier),

    math_string: $ => seq('$', repeat($.math_token), '$'),
    math_token: $ => choice(
      prec(3, $.identifier),
      prec(2, seq('(', repeat($.math_token), ')')),
      prec(1, choice('=', ':', '+'))
    ),

    identifier: $ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,
    number: $ => /0|[1-9][0-9]*/,

    comment: $ => seq(
      '--',
      choice(
        prec(1, seq('|', field('doc', /.*/))),
        /.*/,
      ),
    ),
  }
});
