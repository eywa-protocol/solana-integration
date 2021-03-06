export type EywaBridge = {
  "version": "0.0.0",
  "name": "eywa_bridge",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeed",
          "type": "u8"
        }
      ]
    },
    {
      "name": "receiveRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "requestId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "contractBind",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bridgeFrom",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "sinst",
          "type": {
            "defined": "StandaloneInstruction"
          }
        }
      ]
    },
    {
      "name": "transmitRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "selector",
          "type": "bytes"
        },
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "testOracleRequest",
      "accounts": [
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "requestId",
          "type": "publicKey"
        },
        {
          "name": "selector",
          "type": "bytes"
        },
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addContractSendBind",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contractBind",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bindAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "contract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        }
      ]
    },
    {
      "name": "addContractReceiveBind",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contractBind",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "contract",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "settings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "contractSendBind",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oppositeBridge",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "contract",
            "type": "publicKey"
          },
          {
            "name": "senderAuthority",
            "type": "publicKey"
          },
          {
            "name": "senderAuthorityBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "contractReceiveBind",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oppositeBridge",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "contract",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StandaloneInstruction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accounts",
            "type": {
              "vec": {
                "defined": "TransactionAccount"
              }
            }
          },
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "TransactionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "OracleRequest",
      "fields": [
        {
          "name": "requestType",
          "type": "string",
          "index": false
        },
        {
          "name": "bridge",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "requestId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "selector",
          "type": "bytes",
          "index": false
        },
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        },
        {
          "name": "chainId",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ReceiveRequest",
      "fields": [
        {
          "name": "reqId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "receiveSide",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bridgeFrom",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        },
        {
          "name": "senderSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 5300,
      "name": "UnknownBridgeError",
      "msg": "Unknown Bridge Error"
    },
    {
      "code": 5301,
      "name": "UntrustedContract",
      "msg": "UNTRUSTED CONTRACT"
    }
  ]
};

export const IDL: EywaBridge = {
  "version": "0.0.0",
  "name": "eywa_bridge",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpSeed",
          "type": "u8"
        }
      ]
    },
    {
      "name": "receiveRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "requestId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "contractBind",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bridgeFrom",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "sinst",
          "type": {
            "defined": "StandaloneInstruction"
          }
        }
      ]
    },
    {
      "name": "transmitRequest",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "selector",
          "type": "bytes"
        },
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "testOracleRequest",
      "accounts": [
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "requestId",
          "type": "publicKey"
        },
        {
          "name": "selector",
          "type": "bytes"
        },
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "chainId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addContractSendBind",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contractBind",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bindAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "contract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        }
      ]
    },
    {
      "name": "addContractReceiveBind",
      "accounts": [
        {
          "name": "settings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "contractBind",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        },
        {
          "name": "contract",
          "type": {
            "array": [
              "u8",
              20
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "settings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "contractSendBind",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oppositeBridge",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "contract",
            "type": "publicKey"
          },
          {
            "name": "senderAuthority",
            "type": "publicKey"
          },
          {
            "name": "senderAuthorityBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "contractReceiveBind",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oppositeBridge",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          },
          {
            "name": "contract",
            "type": {
              "array": [
                "u8",
                20
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StandaloneInstruction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accounts",
            "type": {
              "vec": {
                "defined": "TransactionAccount"
              }
            }
          },
          {
            "name": "programId",
            "type": "publicKey"
          },
          {
            "name": "data",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "TransactionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "publicKey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "OracleRequest",
      "fields": [
        {
          "name": "requestType",
          "type": "string",
          "index": false
        },
        {
          "name": "bridge",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "requestId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "selector",
          "type": "bytes",
          "index": false
        },
        {
          "name": "receiveSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        },
        {
          "name": "oppositeBridge",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        },
        {
          "name": "chainId",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ReceiveRequest",
      "fields": [
        {
          "name": "reqId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "receiveSide",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bridgeFrom",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        },
        {
          "name": "senderSide",
          "type": {
            "array": [
              "u8",
              20
            ]
          },
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 5300,
      "name": "UnknownBridgeError",
      "msg": "Unknown Bridge Error"
    },
    {
      "code": 5301,
      "name": "UntrustedContract",
      "msg": "UNTRUSTED CONTRACT"
    }
  ]
};
