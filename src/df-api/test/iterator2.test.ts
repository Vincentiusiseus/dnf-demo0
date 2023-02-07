// Node libs
import assert from "assert"

// NPM libs
import { describe } from "mocha"
import _ from "lodash"

// My libs
import { JobsIterator } from "../iterator2"

describe("JobsIterator", function() {
    describe("classGenerator", function() {
        it("Have same output without option and option with false", function() {
            const inst = new JobsIterator()
            const output0 = Array.from(inst.classGenerator())
            const output1 = Array.from(inst.classGenerator({ include_original_data: false }))
            assert(_.isEqual(output0, output1))
        })

        it("Has original_data with option", function() {
            const inst = new JobsIterator()
            const output = Array.from(inst.classGenerator({ include_original_data: true }))
            assert(output.every(entry => entry.original_data.rows != undefined))
        })
    })

    describe("advGenerator", function() {
        it("Has same output without option and all false option", function() {
            const inst = new JobsIterator()
            const output0 = Array.from(inst.advGenerator())
            const output1 = Array.from(inst.advGenerator({ distinguish_buffer: false, include_awks: false }))
            assert(_.isEqual(output0, output1))
        })

        it("Output with distinguish_buffer option has more entries than without", function() {
            const inst = new JobsIterator()
            const output0 = Array.from(inst.advGenerator({ distinguish_buffer: true }))
            const output1 = Array.from(inst.advGenerator({ distinguish_buffer: false }))
            assert(output0.length > output1.length)
        })

        it("Every entries have 'is_buffer' field when using 'distinguish_buffer' option", function() {
            const inst = new JobsIterator()
            const output = Array.from(inst.advGenerator({ distinguish_buffer: true }))
            assert(output.every(entry => "is_buffer" in entry))
        })

        it("Every entries have 'awks' field when using 'include_awks' option", function() {
            const inst = new JobsIterator()
            const output = Array.from(inst.advGenerator({ include_awks: true }))
            assert(output.every(entry => "awks" in entry))
        })

        it("Has both 'is_buffer' and 'awks' fields when using 'distinguish_buffer' and 'include_awks' options", function() {
            const inst = new JobsIterator()
            const output = Array.from(inst.advGenerator({ distinguish_buffer: true, include_awks: true }))
            assert(output.every(entry => "awks" in entry && "is_buffer" in entry))
        })
    })
})