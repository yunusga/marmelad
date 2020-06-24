(function(socket) {
  function isInPage(node) {
    return (node === document.body) ? false : document.body.contains(node);
  }

  const ERROR_MSG_EVENT = 'error:message';
  const TEMPLATE = `
    <style>
      .__bs_scrMsg {
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
    <div class="__bs_scrMsg">
      <div class="__bs_scrMsg__content">
        <p class="__bs_scrMsg__descr">Build error</p>
        <pre class="__bs_scrMsg__code"><%= message %></pre>
      </div>
    </div>
    `;

  const POPUP = document.createElement('div');
  const BODY = document.getElementsByTagName('body')[0];

  socket.on(ERROR_MSG_EVENT, function (error) {
    let message = error.message.replace(/\[\d+m/gm, '');

    if (isInPage(POPUP)) {
      BODY.removeChild(POPUP);
    }

    POPUP.innerHTML = TEMPLATE
      .replace('<%= message %>', message);
    BODY.appendChild(POPUP);

    console.error(message, error);
  });
})(window.___browserSync___.socket);
