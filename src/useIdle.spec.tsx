import { useIdle } from "./useIdle"
import React from "react"
import { createTimeout } from "@corets/promise-helpers"
import { act, render, screen } from "@testing-library/react"

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

      return <h1>{isIdle ? "idle" : "active"}</h1>
    }

    expect(localStorage.getItem("last-activity")).toBe(null)

    render(<Test/>)

    const target = screen.getByRole("heading")

    expect(target).toHaveTextContent("active")
    expect(isNaN(Date.parse(localStorage.getItem("last-activity")!))).toBe(
      false
    )

    expect(renders).toBe(1)

    await act(() => createTimeout(100))

    expect(target).toHaveTextContent("active")
    expect(renders).toBe(1)

    await act(() => createTimeout(600))

    expect(target).toHaveTextContent("idle")
    expect(renders).toBe(2)

    await act(() => createTimeout(550))

    expect(target).toHaveTextContent("idle")
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

    expect(target).toHaveTextContent("active")
    expect(renders).toBe(3)

    await act(() => createTimeout(100))

    expect(target).toHaveTextContent("active")
    expect(renders).toBe(3)

    await act(() => createTimeout(380))

    expect(target).toHaveTextContent("active")
    expect(renders).toBe(3)

    localStorage.setItem("last-activity", "foo")

    await act(() => createTimeout(480))

    expect(target).toHaveTextContent("active")
    expect(renders).toBe(3)

    await act(() => createTimeout(150))

    expect(target).toHaveTextContent("idle")
    expect(renders).toBe(4)

    await act(() => createTimeout(200))

    expect(target).toHaveTextContent("idle")
    expect(renders).toBe(4)
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

      return <h1>{isIdle ? "idle" : "active"}</h1>
    }

    expect(localStorage.getItem("foo")).toBe(null)

     render(<Test />)

    const target = screen.getByRole("heading")

    expect(isNaN(Date.parse(localStorage.getItem("foo")!))).toBe(false)
    expect(target).toHaveTextContent("active")
    expect(renders).toBe(1)

    const listenerKeys = Object.keys(listeners)

    expect(listenerKeys).toEqual(["error", "click"])

    await act(() => createTimeout(600))

    expect(target).toHaveTextContent("idle")
    expect(renders).toBe(2)

    act(() => {
      listeners["click"]()
    })

    expect(target).toHaveTextContent("active")
    expect(renders).toBe(3)
  })
})
