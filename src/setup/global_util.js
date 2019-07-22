export const Mixin = {
  methods: {
    /**********************************************************************************
     * Input        => ()
     * Output       => (String): Random HEX digit for color, (ex: '#F0F8FF')
     * Description:    generate random color HEX digits.
     **********************************************************************************/
    getRandomColor: () => {
      let letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    /**********************************************************************************
     * Input        => (l:limit => Integer)
     * Output       => (Array): Array of Random HEX digit for color, (ex: [#F0F8FF,#F0F8FF,#F0F8FF])
     * Description:    generate Array of String which contains random color HEX digits.
     **********************************************************************************/
    getRandomColorArr: function (l) {
      return Array(l).fill().map((_, i) => this.getRandomColor());
    },
    /**********************************************************************************
     * Input        => (v:value: => Any)
     * Output       => (Boolean)
     * Description:    Check whether given value is empty.
     **********************************************************************************/
    isEmpty: function (v) {
      return (v == "" || v == null || v == undefined || (v != null && typeof v == "object" && !Object.keys(v).length)) ? true : false;
    },
    /**********************************************************************************
     * Input        => (c:css Object      => type of Object,
     *                  i:use 'Style' YN  => Boolean
     *                  t:use  Trim   YN  => Boolean )
     * Output       => (String): All trimmed css String by condition;
     * Description:    Generate full String of css given Object c by condition of i, t
     **********************************************************************************/
    cssStyler: function (c, i, t) {
      let style = '';
      Object.entries(c).forEach(([key, val]) => {
        if (t) {
          return style += key.trim() + ':' + val.trim() + (val.indexOf(';') > 0) ? '' : ';';
        } else {
          return style += key + ':' + val + ';';
        }
      });
      return (i) ? 'style=\"' + style + '\"' : style;
    },
    /**********************************************************************************
     * Input   => (t:text            =>  String)
     * Output  => (Empty):
     * Description:  copy given text to clipboard
     **********************************************************************************/
    selectToCopyToClipboard: function (t) {
      let textArea = document.createElement("textarea");
      textArea.value = t;
      document.body.appendChild(textArea);
      textArea.select();
      let successFailCondition = document.execCommand("Copy");
      textArea.remove();
      console.log('Success', successFailCondition);
    },
    /**********************************************************************************
     * Input   => ()
     * Output  => (Empty):
     * Description:  Minimize or Maximize Side bar Menu
     **********************************************************************************/
    sideBarMiniMaxControl: function () {
      let currentStatus = document.body.className;
      if (currentStatus.indexOf('sidebar-minimized brand-minimized') > -1) document.body.className = "sidebar-lg-show header-fixed sidebar-fixed";
      else document.body.className = "sidebar-lg-show header-fixed sidebar-fixed sidebar-minimized brand-minimized";
    },
    /**********************************************************************************
     * Input   => (s:badges flag String  => String)
     * Output  => (String): variant value
     * Description:  Select badges variant by given val
     **********************************************************************************/
    selectBadges: function (s) {
      const successFlag = ['active', 'success'];
      const secondaryFlag = ['inactive'];
      const dangerFlag = ['banned', 'failure', 'fail'];
      const warningFlag = ['pending'];
      const infoFlag = [];
      const lightFlag = [];
      const darkFlag = [];
      return successFlag.includes(s.toLowerCase()) ? 'success'
        : secondaryFlag.includes(s.toLowerCase()) ? 'secondary'
          : dangerFlag.includes(s.toLowerCase()) ? 'danger'
            : warningFlag.includes(s.toLowerCase()) ? 'warning'
              : infoFlag.includes(s.toLowerCase()) ? 'info'
                : lightFlag.includes(s.toLowerCase()) ? 'light'
                  : darkFlag.includes(s.toLowerCase()) ? 'dark'
                    : 'primary';
    },
    /**********************************************************************************
     * Input   => (s: any String   => String)
     * Output  => (String): with First letter
     * Description:  Select badges variant by given val
     **********************************************************************************/
    capitalize: (s) => {
      if (typeof s !== 'string') return ''
      return s.charAt(0).toUpperCase() + s.slice(1)
    },
    /**********************************************************************************
     * Input   => (s: any String   => String)
     *             o: any object   => Object)
     * Output  => print out on console.log
     * Description:  Console.log if only when it's not in production.
     **********************************************************************************/
    consoleLogEnv: function (s, o) {
     const processEnv = this.$root.$options.components.App.props.processEnv.default;
     if (!this.isEmpty(processEnv) && processEnv != 'production') {
       if(!this.isEmpty(o)){
         console.log(s,o);
       } else {
         console.log(s);
       }
     }
    },
  },
  data: function () {
    let status = (document.body.className.indexOf('sidebar-minimized brand-minimized') > -1) ? true : false;
    return {
      sideBarIsMinimized: status,
      currentNodeEnv: null,
    }
  },
}

