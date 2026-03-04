const greeting = "Hello\nWorld";

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

export async function processData(items) {
    for (const item of items) {
        try {
            const result = await fetch(`https://api.example.com/${item.id}`);
            if (!result.ok) {
                throw new Error(`HTTP ${result.status}`);
            }
            const data = await result.json();
            console.log(`Item ${item.name}: ${JSON.stringify(data)}`);
        } catch (err) {
            console.error("Error:", err);
        }
    }
}

// Regex test
const pattern = /^[a-z]+(\d+)$/gi;
const escaped = "Tab:\t Quote:\" Unicode:\u0041 Hex:\x41";

class Container {
    #items = [];

    push(item) {
        this.#items.push(item);
    }

    get length() {
        return this.#items.length;
    }
}
