"""
Sample Python file for testing escape sequences and keywords.
"""

import os
from typing import List, Optional


def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


async def process_data(items: List[dict]) -> None:
    for item in items:
        try:
            result = await fetch_data(item["id"])
            if result is None:
                raise ValueError(f"No data for {item['name']}")
            yield result
        except Exception as e:
            print(f"Error: {e}")
        finally:
            pass


class Container:
    def __init__(self):
        self._items: List[str] = []

    def add(self, item: str) -> None:
        assert isinstance(item, str)
        self._items.append(item)

    def __repr__(self) -> str:
        return f"Container({len(self._items)} items)"


# Escape sequences
raw_string = r"No \n escapes \t here"
normal_string = "Tab:\t Newline:\n Unicode:\u0041 Octal:\077"
triple_quoted = """
Multi-line string with "quotes" and
special chars: \n \t \\ \x41
"""

# Triple single-quoted
another = '''
Also multi-line with 'quotes'
'''

if __name__ == "__main__":
    for i in range(10):
        while True:
            break
        continue
