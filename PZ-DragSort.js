/**
 *拖到排序功能
 *name:杨永
 *QQ  :377746756
 */
(function() {
  function DragSort(sortBox, callBack) {
    var _this_ = this;
    //保存需要进行排序的容器
    this.sortBox = sortBox;
    //保存回调函数
    this.callBack = callBack || function() {};
    //获取排序容器相对于页面的偏移
    this.sortBoxX = this.sortBox.offset().left;
    this.sortBoxY = this.sortBox.offset().top;
    //保存容器下需要排序的对象列表
    this.sortList = $('.DragSortList', sortBox);
    //给排序对象添加事件
    this.sortList.mousedown(function(evt) {
      evt.preventDefault();
      _this_.sortListMouseDown(this, evt);
    });
  }
  DragSort.prototype = {
    //鼠标在排序对象上按下时
    sortListMouseDown: function(thisObj, evt) {
      var _this = this;
      //当点击的是自身时，就取消自身的排序啊
      $(thisObj).attr('data-isDrag', 'false');
      //获取鼠标按下时相对于自身的位置和宽高和margin,borderWidth
      this.layerX = this.getMouseOffset(thisObj, evt).layerX;
      this.layerY = this.getMouseOffset(thisObj, evt).layerY;
      this.thisObjWidth = $(thisObj).outerWidth();
      this.thisObjHeight = $(thisObj).outerHeight();
      this.thisObjMarginLeft = parseInt($(thisObj).css('marginLeft'));
      this.thisObjMarginTop = parseInt($(thisObj).css('marginTop'));
      this.thisObjBorderWidth = $(thisObj).get(0).clientLeft;

      //设置自身的位置等值
      $(thisObj).css({
        position: 'absolute',
        width: this.thisObjWidth,
        height: this.thisObjHeight - 10,
        left: $(thisObj).position().left,
        top: $(thisObj).position().top,
        opacity: 0.6
      });
      //创建一个虚线框，以便插入
      var DragDashedBox = $("<li class='DragDashedBox'></li>").insertAfter(
        thisObj
      );
      //当鼠标按下时，给document绑定move事件和up事件
      $(document)
        .bind(
          'mousemove',
          this.sortBoxMouseMove.call(
            this,
            this.layerX,
            this.layerY,
            thisObj,
            DragDashedBox
          )
        )
        .mouseup(function() {
          //给自身添加标识，以便后续不进行循环查找排序
          $(thisObj).removeAttr('data-isDrag');
          //当鼠标释放时
          $(thisObj)
            .stop()
            .animate(
              {
                left: $(DragDashedBox).position().left,
                top: $(DragDashedBox).position().top
              },
              'fast',
              function() {
                //如果拖动到第一之前
                if (DragDashedBox.prev().get(0)) {
                  $(this)
                    .removeAttr('style')
                    .insertAfter(DragDashedBox.prev());
                } else {
                  $(this)
                    .removeAttr('style')
                    .prependTo(_this.sortBox);
                }
                $(DragDashedBox).remove();
                //当放置成功执行回调函数
                _this.callBack();
              }
            );
          //当鼠标在document释放时，解除move和up事件
          $(this).unbind('mousemove', _this.sortBoxMouseMoveTo);
          $(this).unbind('mouseup');
        });
    },
    //获取鼠标按下时相对于自身的位置
    getMouseOffset: function(thisObj, evt) {
      return {
        layerX:
          this.getWindowScroll().scrollLeft +
          evt.clientX -
          $(thisObj).offset().left,
        layerY:
          this.getWindowScroll().scrollTop +
          evt.clientY -
          $(thisObj).offset().top
      };
    },
    //获取滚动条的位置
    getWindowScroll: function() {
      return {
        scrollLeft:
          document.documentElement.scrollLeft ||
          window.pageXOffset ||
          document.body.scrollLeft,
        scrollTop:
          document.documentElement.scrollTop ||
          window.pageYOffset ||
          document.body.scrollTop
      };
    },
    setRange: function(x, y) {
      x =
        x < 0
          ? 0
          : x > this.sortBox.outerWidth() - this.thisObjWidth
          ? this.sortBox.outerWidth() - this.thisObjWidth
          : x;
      y =
        y < 0
          ? 0
          : y > this.sortBox.outerHeight() - this.thisObjHeight
          ? this.sortBox.outerHeight() - this.thisObjHeight
          : y;
      return { x: x, y: y };
    },
    //鼠标在排序容器上移动时
    sortBoxMouseMove: function(layerX, layerY, thisObj, DragDashedBox) {
      var _this = this;
      //返回一个拖动函数，以便接触绑定事件并删除
      return (this.sortBoxMouseMoveTo = function(evt) {
        //阻止默认事件，防止拖动时选中文字
        evt.preventDefault();
        var x = _this.setRange(
            _this.getWindowScroll().scrollLeft +
              evt.clientX -
              _this.sortBoxX -
              layerX,
            _this.getWindowScroll().scrollTop +
              evt.clientY -
              _this.sortBoxY -
              layerY
          ).x,
          y = _this.setRange(
            _this.getWindowScroll().scrollLeft +
              evt.clientX -
              _this.sortBoxX -
              layerX,
            _this.getWindowScroll().scrollTop +
              evt.clientY -
              _this.sortBoxY -
              layerY
          ).y;
        //设置拖动框的位置
        $(thisObj).css({
          left: x - 5,
          top: y - 10
        });
        //判断坐标是否交叉
        _this.setCross(
          x + _this.thisObjWidth / 2,
          y + _this.thisObjHeight / 2,
          thisObj,
          DragDashedBox
        );
      });
    },
    setCross: function(x, y, thisObj, DragDashedBox) {
      var _this = this;
      this.sortList.each(function(i, o) {
        if (
          x > $(this).position().left + $(this).outerWidth() / 4 &&
          x <
            $(this).position().left +
              $(this).outerWidth() -
              $(this).outerWidth() / 4 &&
          (y > $(this).position().top + $(this).outerHeight() / 4 &&
            y <
              $(this).position().top +
                $(this).outerHeight() -
                $(this).outerHeight() / 4)
        ) {
          if ($(this).attr('data-isDrag') != 'false') {
            if (x > $(this).position().left + $(this).outerWidth() / 2) {
              $(this).after(DragDashedBox);
            } else {
              $(this).before(DragDashedBox);
            }
          }
        }
      });
    }
  };

  window['DragSort'] = DragSort;
})();
