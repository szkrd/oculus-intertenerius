$(() => {
  let meta = ocin.meta;
  let tags;

  // template renderer
  function render (id, ctx) {
    let tpl = render._tpls[id] = render._tpls[id] || _.template($(`#tpl-${id}`).html());
    $(`#${id}`).html(tpl(ctx));
  }
  render._tpls = {};

  // collect tags, attach posts
  function buildTags (meta) {
    const densityDivider = 10;
    let counter = 0;
    let maxPostCount = 0;

    // collect, uniq, sort
    let collArr = [...new Set(meta.reduce((acc, item) => {
      acc = acc.concat(item.tags);
      return acc;
    }, []))].sort((a, b) => `${a}`.localeCompare(`${b}`, 'hu-HU'));

    // dictionary
    let coll = collArr.reduce((acc, name) => {
      acc[`${name}`] = { title: name, id: counter++ };
      return acc;
    }, {});

    // assign posts
    meta.forEach(post => {
      (post.tags || []).forEach(tagName => {
        if (coll[tagName]) {
          coll[tagName].score = /^[\d.]$/.test(tagName);
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

    return coll;
  }

  function run () {
    tags = buildTags(meta);
    render('tags', { tags });
  }

  // ----

  run();
});
