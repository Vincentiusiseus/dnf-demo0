// My libs
import { classGenerator, advGenerator, awkGenerator } from "~/src/df-api"

export function getAllParams() {
    const params = []
    const class_names = Array.from(classGenerator()).map(entry => entry.class_name)
    for(const class_name of class_names) {
        const advs = Array.from(advGenerator({ distinguish_buffer: true })).filter(entry => entry.class_name == class_name)
        for(const adv of advs) {
            //@ts-ignore
            const adv_name = adv.adv_name
            params.push([class_name, adv_name, adv.is_buffer])
        }
    }
    return params
}