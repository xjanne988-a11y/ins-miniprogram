const { getPostDetail } = require("../../utils/api");

Page({
  data: {
    post: null,
    loading: true,
  },

  onLoad(options) {
    const shortcode = options.shortcode;
    if (shortcode) {
      getPostDetail(shortcode)
        .then((res) => {
          this.setData({ post: res.post || null, loading: false });
        })
        .catch(() => {
          wx.showToast({ title: "加载失败", icon: "none" });
          this.setData({ loading: false });
        });
    }
  },
});
