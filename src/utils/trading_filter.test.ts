
import { filterLinesByKeywords } from "./trading";
import assert from "assert";

console.log("Running filterLinesByKeywords tests...");

// Test Case 1: Basic Matching
{
    const lines = ["apple", "banana", "cherry"];
    const keywords = ["banana"];
    const result = filterLinesByKeywords(lines, keywords);
    assert.deepStrictEqual(result, ["banana"], "Failed Basic Matching");
}

// Test Case 2: Case Insensitivity
{
    const lines = ["Apple", "BANANA", "Cherry"];
    const keywords = ["apple", "banana"];
    const result = filterLinesByKeywords(lines, keywords);
    assert.deepStrictEqual(result, ["Apple", "BANANA"], "Failed Case Insensitivity");
}

// Test Case 3: Special Characters (P&L)
{
    const lines = ["Total P&L: 100", "Profit: 50", "Loss: 20"];
    const keywords = ["P&L"];
    const result = filterLinesByKeywords(lines, keywords);
    assert.deepStrictEqual(result, ["Total P&L: 100"], "Failed Special Characters");
}

// Test Case 4: Special Characters Mixed Case (p&l)
{
    const lines = ["Total P&L: 100", "Total p&l: 200"];
    const keywords = ["p&l"]; // keyword is lowercase, should match P&L
    const result = filterLinesByKeywords(lines, keywords);
    assert.deepStrictEqual(result, ["Total P&L: 100", "Total p&l: 200"], "Failed Special Characters Mixed Case");
}

// Test Case 5: No Matches
{
    const lines = ["apple", "banana"];
    const keywords = ["cherry"];
    const result = filterLinesByKeywords(lines, keywords);
    assert.deepStrictEqual(result, [], "Failed No Matches");
}

// Test Case 6: Empty Inputs
{
    const lines = ["apple"];
    const keywords: string[] = [];
    const result = filterLinesByKeywords(lines, keywords);
    assert.deepStrictEqual(result, [], "Failed Empty Keywords");
}

{
    const lines: string[] = [];
    const keywords = ["apple"];
    const result = filterLinesByKeywords(lines, keywords);
    assert.deepStrictEqual(result, [], "Failed Empty Lines");
}

// Test Case 7: Partial Matches
{
    const lines = ["I have an apple pie", "Banana bread is good"];
    const keywords = ["apple", "banana"];
    const result = filterLinesByKeywords(lines, keywords);
    assert.deepStrictEqual(result, ["I have an apple pie", "Banana bread is good"], "Failed Partial Matches");
}

console.log("All tests passed!");
