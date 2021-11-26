export type TestStub = {
  "version": "0.0.0",
  "name": "test_stub",
  "instructions": [
    {
      "name": "hello",
      "accounts": [
        {
          "name": "person",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "helloSigned",
      "accounts": [
        {
          "name": "person",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    }
  ]
};

export const IDL: TestStub = {
  "version": "0.0.0",
  "name": "test_stub",
  "instructions": [
    {
      "name": "hello",
      "accounts": [
        {
          "name": "person",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "helloSigned",
      "accounts": [
        {
          "name": "person",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    }
  ]
};
