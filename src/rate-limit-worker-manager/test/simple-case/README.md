Simple case 0 (8 workers, 100 tokens/second) and 0a (worker start interval = 1s):
  - 0: [2023-01-24T11:43:27.579Z][Main] { '1': 97, '2': 1, '3': 1, '4': 1 }
  - 0a: [2023-01-24T11:43:46.756Z][Main] { '1': 99, '2': 1 }

Simple case 1 (8 workers, 5 tokens/second) and 1a (worker start interval = 1s):

  - 1: [2023-01-24T11:37:06.104Z][Main] { '1': 92, '2': 2, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1, '8': 1 }
  - 1a: [2023-01-24T11:39:12.736Z][Main] { '1': 73, '2': 2, '3': 2, '4': 19, '5': 1, '6': 1, '7': 1, '8': 1 }

Simple case 2 (8 workers, 100 tokens/second, Random wait from Worker):

```
[2023-01-24T11:39:56.678Z][Main] {
  '1': 13,
  '2': 13,
  '3': 14,
  '4': 14,
  '5': 12,
  '6': 12,
  '7': 10,
  '8': 12
}
```