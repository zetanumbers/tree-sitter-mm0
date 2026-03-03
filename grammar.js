/**
 * @file A parser for the Metamath Zero language
 * @author Daria Sukhonina <dariasukhonina@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "metamath_zero",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => repeat($.statement),

    statement: $ => $.sort_stmt,
    // statement: $ => choice($.sort_stmt, $.term_stmt, $.assert_stmt, $.def_stmt, $.notation_stmt, $.inout_stmt),

    sort_stmt: $ => seq(optional("pure"), optional("strict"), optional("provable"), optional("free"), "sort", $.identifier, ";"),

    lexeme: $ => choice($.symbol, $.identifier, $.number, $.math_string),
    symbol: $ => choice("*", ".", ":", ";", "(", ")", ">", "{", "}", "=", "_"),
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    number: $ => /0 | [1-9][0-9]*/,
    math_string: $ => seq("$", /[^\$]*/, "$")
  }
});
