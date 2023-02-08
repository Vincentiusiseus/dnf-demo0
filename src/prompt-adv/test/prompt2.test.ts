import assert, { AssertionError } from "assert"

// NPM libs
import sinon from "sinon"

// My lib
import * as prompt2 from "../prompt2"
import { JobsIterator } from "~/src/df-api/iterator2"

describe("prompt2", function() {
    describe("", function() {
        this.afterEach(() => {
            sinon.restore()
        })

        it("Ordinary dealer", async  function() {
            const inst = new JobsIterator()
            const class_entry = Array.from(inst.classGenerator())[0]
            sinon.stub(prompt2.PromptAdv.prototype, "promptClass").returns(Promise.resolve({
                class: class_entry
            }))

            const advs = Array.from(inst.advGenerator({ include_awks: true })).filter(entry => entry.class_name == class_entry.class_name)
            const stub0 = sinon.stub(prompt2.PromptAdv.prototype, "promptAdv")
            stub0.returns(Promise.resolve({
                adv: advs[0]
            }))
            const result = await prompt2.promptAdv()

            const stub1 = sinon.stub(prompt2.PromptAdv.prototype, "promptIsBuffer")
            assert(stub1.notCalled)
        })

        it("Buffer-buffer", async  function() {
            const inst = new JobsIterator()
            const class_entry = Array.from(inst.classGenerator()).filter(entry => entry.class_name == "프리스트(여)")[0]
            sinon.stub(prompt2.PromptAdv.prototype, "promptClass").returns(Promise.resolve({
                class: class_entry
            }))

            const advs = Array.from(inst.advGenerator({ include_awks: true })).filter(entry => entry.class_name == class_entry.class_name)
            const target_adv = advs.filter(entry => entry.adv_name == "크루세이더")[0]
            sinon.stub(prompt2.PromptAdv.prototype, "promptAdv").returns(Promise.resolve({
                adv: target_adv
            }))
            const stub = sinon.stub(prompt2.PromptAdv.prototype, "promptIsBuffer").returns(Promise.resolve({
                is_buffer: true
            }))
            const result = await prompt2.promptAdv()

            assert(stub.calledOnce)
        })

        it("No advancement class", async  function() {
            const inst = new JobsIterator()
            const class_entry = Array.from(inst.classGenerator()).filter(entry => entry.class_name == "다크나이트")[0]
            sinon.stub(prompt2.PromptAdv.prototype, "promptClass").returns(Promise.resolve({
                class: class_entry
            }))

            const stub0 = sinon.stub(prompt2.PromptAdv.prototype, "promptAdv")
            const stub1 = sinon.stub(prompt2.PromptAdv.prototype, "promptIsBuffer")
            const result = await prompt2.promptAdv()

            assert(stub0.notCalled)
            assert(stub1.notCalled)
        })
    })
})