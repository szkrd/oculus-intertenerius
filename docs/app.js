// TODO clean up this mess :D
$(() => {
  const POPULAR_COUNT = 5;

  let meta = ocin.meta;
  let posts = [];
  let tags = [];

  function render (id, ctx) {
    let tpl = render._tpls[id] = render._tpls[id] || _.template($(`#tpl-${id}`).html());
    $(`#${id}`).html(tpl(ctx));
  }
  render._tpls = {};

  function buildTags (meta, asArray = true) {
    const densityDivider = 10;
    let counter = 0;
    let maxPostCount = 0;

    // collect, uniq, sort
    let collArr = [...new Set(meta.reduce((acc, item) => {
      acc = acc.concat(item.tags);
      return acc;
    }, []))].sort((a, b) => `${a}`.localeCompare(`${b}`, 'hu-HU'));

    // convert array to object
    let coll = collArr.reduce((acc, name) => {
      acc[`${name}`] = { title: name, id: counter++ };
      return acc;
    }, {});

    // assign posts
    meta.forEach(post => {
      (post.tags || []).forEach(tagName => {
        if (coll[tagName]) {
          coll[tagName].selected = false;
          coll[tagName].visible = false;
          coll[tagName].score = /^[\d.]*$/.test(tagName);
          coll[tagName].posts = coll[tagName].posts || [];
          coll[tagName].posts.push(post);
          maxPostCount = Math.max(maxPostCount, coll[tagName].posts.length);
        }
      });
    });

    // add density
    Object.keys(coll).forEach(key => {
      let item = coll[key];
      item.density = Math.floor(item.posts.length / maxPostCount * 100 / densityDivider);
    });

    return asArray ? _.values(coll) : coll;
  } // end buildTags

  function injectUrls (meta) {
    meta.forEach(post => {
      post.url = `https://github.com/szkrd/oculus-intertenerius/blob/master/posts/${post.fileName}.md`;
    });
  }

  function resetSelection () {
    tags.forEach(tag => { tag.selected = false; });
  }

  function hideAllTags () {
    tags.forEach(tag => { tag.visible = false; });
  }

  function updatePostList () {
    let coll = {};
    tags.filter(tag => tag.selected).forEach(tag => {
      tag.posts.forEach(post => { coll[post.id] = post; });
    });
    posts = _.values(coll);
  }

  function onTagsClick (e) {
    let el = $(e.target);
    if (!el.is('input')) {
      return;
    }
    let tagId = parseInt(el.val(), 10);
    let tag = tags.find(tag => tag.id === tagId);
    tag.selected = el.is(':checked');
    updatePostList();
    render('posts', { posts });
  }

  function onRangeSelectorClick (e) {
    let val = parseInt(e.target.value, 10);
    if (!val) {
      return;
    }
    hideAllTags();
    tags.filter(tag => tag.posts.length >= val).forEach(item => { item.visible = true; });
    render('tags', { tags });
  }

  function onControlButtonClick (e) {
    let el = $(e.target);
    let action = el.data('action');
    if (!action) {
      return;
    }

    let enable = collection => collection.forEach(item => { item.visible = true; });

    if (action === 'score') {
      hideAllTags();
      enable(tags.filter(tag => tag.score));
    } else if (action === 'popular') {
      hideAllTags();
      enable(tags.filter(tag => tag.posts.length > POPULAR_COUNT));
    } else if (action === 'all') {
      hideAllTags();
      enable(tags);
      $('#tag-range').val(0);
    } else if (action === 'deselect') {
      resetSelection();
    }

    render('tags', { tags });
  }

  // ----

  (function () {
    injectUrls(meta);
    tags = buildTags(meta);
    tags.filter(tag => tag.score).forEach(tag => { tag.visible = true; });
    $('#tags').on('click', onTagsClick);
    $('#tag-range').on('input', onRangeSelectorClick);
    $('#controls button').on('click', onControlButtonClick);
    let maxPostCountForTag = Math.max.apply(Math, tags.map(tag => tag.posts.length));
    $('#tag-range').attr('max', maxPostCountForTag);
    render('tags', { tags });
  }());
});
