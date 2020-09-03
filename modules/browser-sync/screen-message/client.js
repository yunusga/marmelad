((socket) => {
  function isInPage(node) {
    return (node === document.body) ? false : document.body.contains(node);
  }

  const ERROR_MSG_EVENT = 'error:message';
  const TEMPLATE = `
    <style>
      .__bs_scrMsg {
        font-family: monospace;
        font-weight: 400;
        position: fixed;
        z-index: 100500;
        top:0;
        left:0;
        width:100%;
        height:100vh;
        overflow: auto;
        background-color: rgba(244, 67, 54, 0.8);
        padding: 16px;
        font-size:16px;
        line-height: 1.45;
      }
      .__bs_scrMsg__descr {
        position: relative;
      }
      .__bs_scrMsg__close {
        position: absolute;
        padding: 0;
        top: 0;
        right: 0;
      }
      .__bs_scrMsg__close_icon {
        display: inline-block;
        width: 24px;
        height: 24px;
        vertical-align: top;
      }
      .__bs_scrMsg__content {
        background-color: #f6f8fa;
        border-radius: 3px;
        padding: 16px;
        width:100%;
        max-width:780px;
        margin: 0 auto;
      }
      .__bs_scrMsg__code {
        font-size: 14px !important;
        width: 100%;
        overflow: auto;
      }
      </style>
    <div id="__bs_scrMsg" class="__bs_scrMsg">
      <div class="__bs_scrMsg__content">
        <div class="__bs_scrMsg__descr">
          Build error
          <button class="__bs_scrMsg__close" type="button" onclick="getElementById('__bs_scrMsg').remove()"><svg class="__bs_scrMsg__close_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs/><path d="M19 6.4L13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5z"/></svg></button>
        </div>
        <pre class="__bs_scrMsg__code"><%= message %></pre>
      </div>
    </div>
    `;

  const POPUP = document.createElement('div');
  const BODY = document.getElementsByTagName('body')[0];

  socket.on(ERROR_MSG_EVENT, (error) => {
    // eslint-disable-next-line no-control-regex
    const message = error.message.replace(/\[\d+m/gm, '');

    if (isInPage(POPUP)) {
      BODY.removeChild(POPUP);
    }

    POPUP.innerHTML = TEMPLATE
      .replace('<%= message %>', message);
    BODY.appendChild(POPUP);

    console.error(message, error);
  });
})(window.___browserSync___.socket);
