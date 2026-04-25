// CityData.js
module.exports = {
    "nodes": [
    {
      "id": 0,
      "name": "function_1",
      "pos": [0, 0, 0],
      "height": 1,
      "color": [1, 0, 0, 1]
    },
    {
      "id": 1,
      "name": "function_2",
      "pos": [10, 0, 0],
      "height": 1,
      "color": [0, 1, 0, 1]
    },
    {
      "id": 2,
      "name": "function_3",
      "pos": [-10, 0, 0],
      "height": 1,
      "color": [1, 0, 0, 1]
    },
    {
      "id": 3,
      "name": "function_4",
      "pos": [0, 5, 10],
      "height": 1,
      "color": [0, 0, 1, 1]
    },
    {
      "id": 4,
      "name": "function_5",
      "pos": [0, 5, -10],
      "height": 1,
      "color": [0, 0, 1, 1]
    },
    {
      "id": 5,
      "name": "function_6",
      "pos": [5, 0, 10],
      "height": 1,
      "color": [0, 0, 1, 1]
    },
  
  ],
  "connections": [
    {
      "from": 0,
      "to": 1
    },
    {
      "from": 0,
      "to": 2
    },
    {
      "from": 0,
      "to": 3
    },
    {
      "from": 1,
      "to": 3
    },
    {
      "from": 4,
      "to": 3
    }
  ]
  };