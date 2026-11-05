// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { detectCrisis } from "./safety.js";

test("crisis: catches clear self-harm phrases in English, Hinglish and Hindi", () => {
  for (const t of [
    "I want to kill myself",
    "honestly I just want to die after this result",
    "I don't want to live anymore",
    "everyone would be better off without me",
    "I have been self-harming",
    "thinking about suicide",
    "main mar jaana chahta hoon",
    "jeena nahi chahti ab",
    "khudkushi kar lunga",
    "मैं आत्महत्या के बारे में सोच रहा हूँ",
  ]) assert.equal(detectCrisis(t), true, t);
});

test("crisis: does not trigger on everyday study talk", () => {
  for (const t of [
    "this chapter is killing me",
    "I died laughing at that mnemonic",
    "explain the cell death process (apoptosis)",
    "how do I kill a process in Linux",
    "the character dies at the end of the novel",
    "I am dying to know the answer",
    "",
    null,
  ]) assert.equal(detectCrisis(t), false, String(t));
});
