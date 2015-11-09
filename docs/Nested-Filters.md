# 4. Nested filters

Please edit your `sift.json` file to look like this:

`"dag": { "$ref":"./dag4.json" }`

## How far can you nest?

In this step we will augment the email filter of the previous steps with nested conditions.

### inputs

The new email filter has the following conditions:

* The first `conditions` array has three conditions with an `OR` operator.
    - emails that are `from` ~= "receipts\\..+@uber\\.com"
    - OR emails that have `subject` ~= "^\\s*Addison Lee Booking"
    - OR a nested array of conditions 

* The second `conditions` array has two conditions with an `AND` operator.
    - emails that are `from` ~= "billing@hailocab\\.com"
    - and email that have `body` ~= "^\\s*HAILO RECEIPT"

* We are also looking for emails from `all` the mailboxes.


```
"filter": {
    "conditions": [ // 1st
    {
      "conditions": [{ //2nd
        "from": {
          "regexp": {
            "flags": "i",
            "pattern": "billing@hailocab\\.com"
            }
          }
        },
        {
        "body": {
          "regexp": {
            "flags": "i",
            "pattern": "^\\s*HAILO RECEIPT"
          }
        }
      }],
      "operator": "AND"
  },
  {
    "from": {
        "regexp": {
            "flags": "i",
            "pattern": "receipts\\..+@uber\\.com"
        }
    }
  },
  {
    "subject": {
        "regexp": {
            "flags": "i",
            "pattern": "^\\s*Addison Lee Booking"
        }
    }
  }],
  "inMailbox": "all",
  "operator": "OR"
}
```

## Any results?


If your new filters matched more emails and you run again your DAG you should see more entries in all the relevant dbs in IndexedDB.

## Full

**dag4.json**