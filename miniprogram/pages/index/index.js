const { getBloggers, addBlogger } = require("../../utils/api");

Page({
  data: {
    bloggers: [],
    loading: false,
    searchQuery: "",
    addUsername: "",
  },

  onLoad() {
    this.loadBloggers();
  },

  onShow() {
    this.loadBloggers();
  },

  loadBloggers() {
    this.setData({ loading: true });
    getBloggers()
      .then((res) => {
        this.setData({ bloggers: res.bloggers || [], loading: false });
      })
      .catch(() => {
        wx.showToast({ title: "加载失败", icon: "none" });
        this.setData({ loading: false });
      });
  },

  onSearchInput(e) {
    this.setData({ searchQuery: e.detail.value });
  },

  onSearch() {
    const q = this.data.searchQuery.trim();
    if (!q) return;
    wx.navigateTo({ url: "/pages/blogger/blogger?username=" + q });
  },

  onAddInput(e) {
    this.setData({ addUsername: e.detail.value });
  },

  onAdd() {
    const username = this.data.addUsername.trim();
    if (!username) {
      wx.showToast({ title: "请输入用户名", icon: "none" });
      return;
    }
    wx.showLoading({ title: "正在抓取..." });
    addBlogger(username)
      .then((res) => {
        wx.hideLoading();
        if (res.error) {
          wx.showToast({ title: res.error, icon: "none" });
        } else {
          wx.showToast({ title: "添加成功", icon: "success" });
          this.setData({ addUsername: "" });
          this.loadBloggers();
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: "添加失败", icon: "none" });
      });
  },

  onTapBlogger(e) {
    const username = e.currentTarget.dataset.username;
    wx.navigateTo({ url: "/pages/blogger/blogger?username=" + username });
  },

  onLoadMore() {},
});
