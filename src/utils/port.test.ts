
import { killProcessOnPort } from "./port";

console.log("Testing invalid port -1...");
try {
    killProcessOnPort(-1);
    console.error("FAIL: Should have thrown for -1");
    process.exit(1);
} catch (e: any) {
    if (e.message.includes("Invalid port number")) {
        console.log("PASS: Threw expected error for -1");
    } else {
        console.error("FAIL: Unexpected error:", e);
        process.exit(1);
    }
}

console.log("Testing invalid port 70000...");
try {
    killProcessOnPort(70000);
    console.error("FAIL: Should have thrown for 70000");
    process.exit(1);
} catch (e: any) {
    if (e.message.includes("Invalid port number")) {
        console.log("PASS: Threw expected error for 70000");
    } else {
        console.error("FAIL: Unexpected error:", e);
        process.exit(1);
    }
}

console.log("Testing invalid port 1.5...");
try {
    killProcessOnPort(1.5);
    console.error("FAIL: Should have thrown for 1.5");
    process.exit(1);
} catch (e: any) {
    if (e.message.includes("Invalid port number")) {
        console.log("PASS: Threw expected error for 1.5");
    } else {
        console.error("FAIL: Unexpected error:", e);
        process.exit(1);
    }
}

console.log("Testing valid port 3000...");
try {
    // This might log an error to console because no process is running, but it should not throw out of the function
    killProcessOnPort(3000);
    console.log("PASS: Valid port 3000 processed without throwing validation error");
} catch (e) {
    console.error("FAIL: Threw error for valid port 3000:", e);
    process.exit(1);
}

console.log("All tests passed!");
