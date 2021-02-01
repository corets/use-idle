import { useIdle } from "./useIdle"
import React from "react"
import { mount } from "enzyme"
import { createTimeout } from "@corets/promise-helpers"
import { act } from "react-dom/test-utils"

describe("useIdle", () => {
  it("tracks idle status", async () => {
    const listeners = {}
    window.addEventListener = jest.fn((event, cb) => {
      listeners[event] = cb
    })
    let renders = 0

    const Test = () => {
      renders++
      const isIdle = useIdle({ threshold: 500, interval: 100 })

      return <div>{isIdle ? "idle" : "active"}</div>
    }

    expect(localStorage.getItem("last-activity")).toBe(null)

    const wrapper = mount(<Test />)
    const targetText = () => wrapper.find("div").text()

    expect(targetText()).toBe("active")
    expect(isNaN(Date.parse(localStorage.getItem("last-activity")!))).toBe(
      false
    )

    expect(renders).toBe(1)

    await act(() => createTimeout(100))

    expect(targetText()).toBe("active")
    expect(renders).toBe(1)

    await act(() => createTimeout(600))

    expect(targetText()).toBe("idle")
    expect(renders).toBe(2)

    await act(() => createTimeout(550))

    expect(targetText()).toBe("idle")
    expect(renders).toBe(2)

    const listenerKeys = Object.keys(listeners)

    expect(listenerKeys).toEqual([
      "error",
      "mousemove",
      "mouseup",
      "keyup",
      "focus",
      "resize",
    ])

    act(() => {
      listeners["mousemove"]()
    })

    expect(targetText()).toBe("active")
    expect(renders).toBe(3)

    await act(() => createTimeout(100))

    expect(targetText()).toBe("active")
    expect(renders).toBe(3)

    await act(() => createTimeout(380))

    expect(targetText()).toBe("active")
    expect(renders).toBe(3)

    localStorage.setItem("last-activity", "foo")

    await act(() => createTimeout(480))

    expect(targetText()).toBe("active")
    expect(renders).toBe(3)

    await act(() => createTimeout(150))

    expect(targetText()).toBe("idle")
    expect(renders).toBe(4)

    await act(() => createTimeout(200))

    expect(targetText()).toBe("idle")
    expect(renders).toBe(4)

    wrapper.unmount()
  })

  it("takes custom events and a custom local storage key", async () => {
    const listeners = {}
    window.addEventListener = jest.fn((event, cb) => {
      listeners[event] = cb
    })
    let renders = 0

    const Test = () => {
      renders++
      const isIdle = useIdle({
        threshold: 500,
        interval: 100,
        events: ["click"],
        storageKey: "foo",
      })

      return <div>{isIdle ? "idle" : "active"}</div>
    }

    expect(localStorage.getItem("foo")).toBe(null)

    const wrapper = mount(<Test />)
    const targetText = () => wrapper.find("div").text()

    expect(isNaN(Date.parse(localStorage.getItem("foo")!))).toBe(false)
    expect(targetText()).toBe("active")
    expect(renders).toBe(1)

    const listenerKeys = Object.keys(listeners)

    expect(listenerKeys).toEqual(["error", "click"])

    await act(() => createTimeout(600))

    expect(targetText()).toBe("idle")
    expect(renders).toBe(2)

    act(() => {
      listeners["click"]()
    })

    expect(targetText()).toBe("active")
    expect(renders).toBe(3)
  })
})
