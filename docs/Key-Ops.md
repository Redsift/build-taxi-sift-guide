# 3. Key Operations

Please edit your `sift.json` file to look like this:

`"dag": { "$ref":"./dag3.json" }`

## Using `with` in nodes.

In this example we are focusing on a node that performs a join operation over two inputs sources using the `with` property and outputs data to a `store` that is also using as an input. 


### nodes

We are extending the `Messages mapper` node from the previous example. It now performs a join over `messages` and `msgdates` by using the `$hash` anchor. The `select` fields are used effectively as the two sides of the relationship you would expect after the `ON` operator in a regular SQL JOIN operation. The value `$hash` in each of them means select the entire key from each side and try to match it. 

When we have a match the `with` property in the arguments of the implementation function, will be populated.

Another new thing, in this node is the fact that it has two outputs. This is possible with the use of the `name` field in each of the JSON objects that our implementation emits.

The last interesting bit here, is the cycle back of data from the node's output to its input. The trick here is that this will happen at a later stage. First the node will compute as if it had only one input and when data become available in the second input the node will be triggered again for a new computation. In this particular case we are using it to remove the value of a deleted email from our calculations.

We brought back `node1` as an intermediate step since we are performing a key operation over our node's inputs and we are restricted from using directly a DAG `input`.

The addition of nodes `node2` and `node3` is done for educational reasons, to observe their output, and have no meaning in our computation process.

```
[{
  "#": "node1",
  "input": {
    "bucket": "taxi"
  },
  "outputs": {
    "messages": {}
  }
},{
  "#": "Messages mapper",
  "implementation": {
    "node": "server/map2.js"
  },
  "input": {
    "bucket": "messages",
    "select": "$hash",
    "with": {
      "bucket": "msgdates",
      "select": "$hash"
    }
  },
  "outputs": {
    "msgdates": {},
    "receipts": {}
  }
},{
  "#": "node2",
  "input": {
    "bucket": "receipts"
  },
  "outputs": {
    "outReceipts":{}
  }
},{
  "#": "node3",
  "input": {
    "bucket": "msgdates"
  },
  "outputs": {
    "outMsgdates":{}
  }
}]
```

### implementation 

The implementation is the same as before pretty much with two differences:

* we are now emitting events to a second store as per the definition of our node above

```
...
ret.push({
      name: 'msgdates', 
      key:  d.key.split('/')[0], 
      value: {
        currency: currency, 
        company: company, 
        msgId: msg.id, 
        date: date
    }
});
...
```

* We are addressing an extra case in our code, when we receive an input event without a value. 
Usually, that happens when an email gets deleted and triggers an event for the DAG to compute again. To simulate that during development we can delete one of the files inside the _messages_ directory. It can be found at:
&lt;siftDir&gt;/sdk_runs/&lt;latestCreatedFile&gt;/&lt;nameOfDagEmailInput&gt;/messages

### outputs

A couple of dummy outputs just to be able to observe the data in our stores.

```
"exports":{
  "outReceipts":{
    "key$schema":"string/string"
  },
  "outMsgdates":{
    "key$schema": "string"
  }
}
```


### stores

We moved `receipts` from `outputs` to `stores` and added `messages` and `msgdates`.

```
"stores": {
  "messages": {
    "key$schema": "string"
  },
  "receipts": {
      "key$schema": "string/string"
  },
  "msgdates": {
      "key$schema": "string"
  }
}
```


## Full

**dag3.json**

**server/map2.json**