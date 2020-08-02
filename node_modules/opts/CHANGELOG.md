= Changelog

  * ... .., 2012 -- v1.2.0 
  * ... .., 2012 -- v1.2.1
  * ... .., 2012 -- v1.2.2
  * ... .., 2017 -- v1.2.4
  * ... .., 2017 -- v1.2.5
  * ... .., 2017 -- v1.2.6

  * Oct 29, 2019 -- v1.2.7
    no code changes, added typescript definitions

  * Jun 29, 2020 -- v2.0.0
      * Added `flags()` to retrieve all the flags at once.
        Example:
        ```javascript
        opts.parse([{
          value: true, required: true,
          short: 'n', long: 'num'
        }, {
          short: 'b', long: 'bool'
        }])
        const { n, b } = opts.flags()
        ```

      * Changes the output of the auto-generated help text.
        1) Splits and pops `argv[0]`
        2) Replaces `pwd` with "." in `argv[1]`

        Example Change:
        ```bash
        ok@laptop: opts [master]× » node examples/example2.js --help
        Usage: /home/ok/.nvm/versions/node/v12/bin/node /home/ok/khtdr.com/opts/examples/example2.js [options]
        Show this help message
            --help
            ...
        ```

        Becomes:
        ```bash
        ok@laptop: opts [master]× » node examples/example2.js --help
        Usage: node ./examples/example2.js [options]
        Show this help message
            --help
            ...
        ```  

        This is a *breaking change* if you are parsing the help text.
