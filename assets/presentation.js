window.presentation = (view, result, params) => {
    const maximum = list =>  R.reduce(R.max, -Infinity, list)
    const ln = Math.log

    const link = (function() {
        var curvature = .5;

        function link(d) {
          var x0 = d.source.x + d.source.w,
              x1 = d.target.x,
              xi = d3.interpolateNumber(x0, x1),
              x2 = xi(curvature),
              x3 = xi(1 - curvature),
              y0 = d.source.y + d.sy + d.dy / 2,
              y1 = d.target.y + d.ty + d.dy / 2;
          return "M" + x0 + "," + y0
               + "C" + x2 + "," + y0
               + " " + x3 + "," + y1
               + " " + x1 + "," + y1;
        }

        link.curvature = function(_) {
          if (!arguments.length) return curvature;
          curvature = +_;
          return link;
        };

        return link;
      })();

    const maxLevel = 5
    const ignoreLevel0Drops = false

    const stepSize = 300
    const nodeWidth = 50
    const initialGap = 250


    const coTcountLens = o =>
        !!o && !!o.co && !!o.co.node && !!o.co.node.tcount ? o.co.node.tcount : 0

    const opTcountLens = o =>
        !!o && !!o.op && !!o.op.node && !!o.op.node.tcount ? o.op.node.tcount : 0

    const makeLens = R.curry((g, f, o) =>
        !!o && !!f(o) && !!f(o).node ? g(f(o).node) : null
    )

    const websLens = makeLens(o => o.webs)
    const coWebsLens = websLens(o => o.co)
    const opWebsLens = websLens(o => o.op)


    const tooltipTransform = (scale, node)  =>
        `scale(${1 / scale}) translate(${scale * nodeWidth / 2 - 50}, ${
            (node.type == 'co'  && node.arr[0] == 0 || node.type == 'op' && node.arr[0] == 1)  ? -70 : scale * node.size })`

    var addToolTip = null


    const render = otree => {
        const $svg = d3.select(view)
            .selectAll('svg g.main').data([{}])

        $svgEnter = $svg.enter().append('svg')
            .attr('width', `${view.clientWidth}px`)
            .attr('height', `${view.clientHeight}px`)
            .style({'background-color': '#183051'})
            .call(d => {
                d.html(`<defs>
                    <pattern id="pattern-stripe"
                      width="10" height="4"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(-45)">
                      <rect width="3" height="4" transform="translate(0,0)" fill="rgba(255, 255, 255, 1)"></rect>
                    </pattern>
                    <mask id="mask-stripe">
                      <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" />
                    </mask>
                  </defs>`)
            })

        const $defs = $svg.select('defs')


        $svg.append('g').attr('transform', 'translate(0, 80) scale(0.7)').append('g').attr('class', 'main')
        const $main = $svg.select('g.main')

        const zoomListener = d3.behavior.zoom().scaleExtent([0.8, 100]).on("zoom", function () {
            $main.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")
            d3.selectAll('g.tscale').attr('transform', r =>
                tooltipTransform(d3.event.scale, r.node)
            )
        })
        $svgEnter.call(zoomListener)

        window.zoomListener = zoomListener

        zoomListener.translate([-180, nodeWidth])
        $main.attr("transform", `translate(-180, ${nodeWidth})`)

        // PNG REPORT:
        $main.attr('transform', 'translate(-369.4167673662712,126.92620229498891)scale(1.6526248857954282)')
        $svg.attr('height', '2000')


        // header
        $svgEnter.append('g').attr('class', 'outer').attr('transform', 'translate(0, 0)')
          .append('g').attr({'class': 'header', 'transform': ``}).call($header => {

            $header.append('rect').attr({x: 0, y: 0, width: view.clientWidth, height: 80, fill: '#183051'})

            $header.append('g').attr('class', 'topTotle').attr('transform', `translate(${0}, ${20})`)
            .call($title => {
              $title.append('text').style({'font-size': 20}).attr({x: 80, y: 2 + 10, 'fill': 'white', 'alignment-baseline': 'middle'}).text(`${params.country} Stores`)
              $title.append('text').style({'font-size': 16}).attr({x: 80, y: 10 + 31, 'fill': 'white', 'alignment-baseline': 'middle'}).text(`Customers: ${params.cFromDate} - ${params.cToDate}`)
              $title.append('text').style({'font-size': 16}).attr({x: 80, y: 10 + 31 + 21, 'fill': 'white', 'alignment-baseline': 'middle'}).text(`Purchases: ${params.pFromDate} - ${params.pToDate}`)
            })

            $header.append('g').attr('class', 'topLegend').attr('transform', `translate(${view.clientWidth - 600}, ${20})`)
            .call($legend => {
              const addRect = (i, color, label, mask = false) =>
                $legend.append('g').attr({transform: `translate(${i * 130}, 0)`}).call($g => {
                  $g.append('rect').attr(R.merge({
                    x: 0,
                    y: 0,
                    width: 32,
                    height: 32,
                    rx: 10,
                    ry: 10,
                    fill: color
                  }, !! mask ? {mask: 'url(#mask-stripe)'} : {}))
                  $g.append('text').attr({x: 50, y: 18, 'alignment-baseline': 'middle', fill: 'white'}).text(label)
                })

              addRect(0, '#3778c6', 'Retail')
              addRect(1, '#845582', 'Omni')
              addRect(2, '#e2f2fb', 'Online')
              addRect(3, '#e2f2fb', 'Not Returning', true)
            })
          })


        addToolTip = (function() {
            var _tooltips = []
            return t => {
                const _ntooltips = _tooltips.filter(p => t.id != p.id)
                if(_ntooltips.length != _tooltips.length) {
                    // remove the tooltip
                    _tooltips = _ntooltips
                } else {
                    // add the new tooltip
                    _tooltips = _tooltips.concat(t)
                }
                visualize($defs, $main, otree, _tooltips)
            }
        })()

        // axis
        const flatResult =
            R.reject(x => x.level > maxLevel,
              R.drop(1,
                  foldTreeToValue((acc, t) => acc.concat([t]), [], tree)
              )
            )
        R.range(1, maxLevel + 1, stepSize).map(r => {
          const $g = $main.append('g').attr('transform', `translate(${r * stepSize}, 120)`)
          $g.append('line').attr('x1', nodeWidth/2).attr('x2', nodeWidth/2).attr('y1',  -1 * initialGap / 2).attr('y2', view.clientHeight + initialGap)
            .style({stroke: 'black', 'stroke': 'rgba(255, 255, 255, 0.2)', 'stroke-width': 3})
          $g
            .append('g').attr('transform', `translate(${nodeWidth / 2 + stepSize * 0.1}, ${view.clientHeight + initialGap})`)
            .append('text').attr('text-anchor', 'left').style({fill: 'white'}).text(`#${r}`)

          const total = R.pipe(R.filter(x => x.level == r), R.map(r => r.tcount), R.sum)(flatResult)
          $g
            .append('g').attr('transform', `translate(${nodeWidth / 2 + stepSize * 0.1}, ${view.clientHeight + initialGap + 23})`)
            .append('text').attr('text-anchor', 'left').style({fill: 'white'}).text(`${d3.format(',')(total)}`)

        })

        visualize($defs, $main, otree, [])
    }

    const visualize = ($defs, $main, otree, tooltips = []) => {

        let tree = traverse(x => R.merge(x, {}), otree)

        const leftTCount0 = otree.node.tcount

        // igornong drop at level = 1
        const leftTCount = ignoreLevel0Drops
            ? ((otree.co.node.retention * otree.co.node.tcount + (!!otree.op ? otree.op.node.retention * otree.op.node.tcount : 0)))
            : leftTCount0

        if(ignoreLevel0Drops) {
            tree.node.tcount = leftTCount

            tree.co.node.tcount = tree.co.node.tcount * tree.co.node.retention
            tree.co.node.retention = 1

            if(!!tree.op) {
                tree.op.node.tcount = tree.op.node.tcount * tree.op.node.retention
                tree.op.node.retention = 1
            }
        }


        tree = traverse(t => R.merge(t, {size: t.tcount * 900 / leftTCount }), tree)

        // return json(view, tree)

        relayout = tree =>
            foldBoth(
                R.curry((acc, tree) => R.merge(tree, {
                    //y: acc.y,
                    y: (tree.y0 || 0) + (tree.arr[0] == 1 ? acc.y + acc.size - tree.size : acc.y) ,
                    x: acc.x + stepSize
                })),
                R.curry((nco, acc, tree) => {

                    return R.merge(tree, {
                        //y: acc.y + (!!nco ?  nco.size : 0) + Math.min(10, !!nco ?  nco.size * 2 : 2),
                        y: (tree.y0 || 0) + (tree.yp || 0) + (tree.arr[0] == 1 ?
                            acc.y + acc.size - tree.size - (tree.arr.length > 1 && !!nco ? nco.size + 20 : - 20) + (tree.level == 1 && tree.type == 'op' ? initialGap : 0)
                            :
                            acc.y + (!!nco ? nco.size + 10 : 10) //+ Math.min(10, !!nco ?  nco.size * 2 : 2)
                        )
                        ,
                        x: acc.x + stepSize
                    })
                }),
                {y: 0, x: -1 * stepSize},
                tree
            )
        tree = relayout(tree)

        const relayout1 = (level, tree) => {
            let list = R.sortBy(x => x.node.y, getBranchesAtLevel(level, tree))
            const listDist = R.pipe(
                R.map(x => x.node),
                R.sortBy(x => x.y),
                xs => R.zip(xs, R.drop(1, xs))
                , R.map(([a, b]) => b.y + (b.y0 || 0) - (a.y + (a.y0 || 0) + a.size))
            )(list)
            const maxDist = maximum(listDist)
            console.log("maxDist", level, listDist, maxDist, list)
            R.drop(1, R.init(list)).forEach(t => t.node.y0 =
                t.node.arr[0] == 1 ?
                    (t.node.type == 'co' ? 1 : -1) * maxDist / (list.length - 1)
                :   (t.node.type == 'op' ? 1 : -1) * maxDist / (list.length - 1)
            )

            return relayout(tree)
        }

        tree = relayout1(2, tree)
        tree = relayout1(3, tree)
        tree = relayout1(4, tree)
        //tree = relayout1(5, tree)


        // return json(view, tree)

        const flatResult =
            R.reject(x => x.level > maxLevel,
            R.drop(1,
                foldTreeToValue((acc, t) => acc.concat([t]), [], tree)
            )
        )
        // return json(view, flatResult)

        const links = R.reject(x => x.source.arr.length == 0 || x.source.arr.length > (maxLevel - 1), foldDownBothToList(
            (p, co, op) => ({
                sy: p.arr[0] == 1 ? (!!co ? -1 * co.size : 0) : 0,
                dy: co.size,
                ty: 0,
                key: `${p.webs}_${co.webs}`,
                tcount: co.tcount,
                source: {
                    x: p.x,
                    y: p.arr[0] == 1 ? p.y + p.size : p.y,
                    size: p.size,
                    w: nodeWidth,
                    type: p.type,
                    arr: p.arr,
                    tcount: p.tcount
                },
                target: {
                    x: co.x,
                    y: co.y,
                    size: co.size,
                    w: nodeWidth,
                    type: co.type,
                    arr: co.arr,
                    tcount: co.tcount,
                    type: 'co'
                }

            }),
            (p, co, op) => ({
                sy: p.arr[0] == 1 ? ((!!op ? -1 * op.size : 0) - (!!co ? co.size : 0)) : !!co ? co.size : 0,
                dy: op.size,
                ty: 0,
                key: `${p.webs}_${op.webs}`,
                tcount: op.tcount,
                source: {
                    x: p.x,
                    y: p.arr[0] == 1 ? p.y + p.size  : p.y,
                    size: p.size,
                    w: nodeWidth,
                    type: p.type,
                    arr: p.arr,
                    tcount: p.tcount
                },
                target: {
                    x: op.x,
                    y: op.y,
                    size: op.size,
                    w: nodeWidth,
                    type: op.type,
                    arr: op.arr,
                    tcount: op.tcount,
                    type: 'op'
                }

            }),
            tree
        ))

        // return json(view, links)


        const $tooltips = $main.selectAll('g.ttooltip').data(() => {
            return tooltips
        })
        $tooltips.exit().remove()
        $tooltips.enter().append('g').attr('class', 'ttooltip').append('g').attr('class', 'tscale').call(g => {
            g.append('rect').attr('class', 'tcontainer')
                .style({
                    fill: 'wheat',
                    stroke: 'black'
                })
        }).each(function(d) {
            if(!!d.enter)
                d.enter(d3.select(this))
        })

        $tooltips.each(function(d) {
            if(!!d.render)
                d.render(d3.select(this))
        })



        const $rects = $main.selectAll('g.rect').data(flatResult)

        $rects.enter().append('g').attr('class', 'rect').call($g => {

            const showTooltip = rs => {
                rs.on('click', _r => {
                    const r = _r
                    const ts = (r.arr.length + 1) * 0.8
                    const tx = ts * (-1 * r.x + stepSize / 2)
                    const ty = ts * (-1 * r.y +  stepSize / 2)

                    addToolTip({
                        x: r.x, y: r.y, id: r.webs, text: r.webs, node: r,
                        enter: $t => {
                            $t.style({
                                opacity: 0.8
                            })
                            $gs = $t
                            $gs.append('text').attr('class', 'tclose').attr('dy', '1em')
                            .attr('x', 100).attr('dx', '-1em').text('X')


                            $gs.append('text').attr('class', 'tflow').attr('dy', '2em')
                            $gs.append('text').attr('class', 'tsize').attr('dy', '3em')
                            $gs.append('text').attr('class', 'tretention').attr('dy', '4em')
                            $gs.append('text').attr('class', 'tzoom').attr('dy', '1em').style({'text-decoration': 'underline'}).text('Zoom')
                        },
                        render: $t => {
                            const w = 100
                            const h = 70

                            $t.attr('transform', _ => {
                                const tx = r.x
                                const ty = r.y
                                return `translate(${tx}, ${ty})`
                            })

                            $t.select('.tclose').attr('data-webs', r.webs).on('click', r => addToolTip({id: r.node.webs}))
                            $t.select('.tzoom').on('click', _ => {
                                $main.transition().duration(300).attr("transform", "translate(" + tx + "," + ty + ")scale(" + ts + ")")
                                zoomListener.translate([tx, ty]).scale(ts)
                                d3.selectAll('g.tscale').attr('transform', r =>
                                    tooltipTransform(ts, r.node)
                                )
                            })

                            $t.select('.tscale').attr('transform',
                                tooltipTransform(zoomListener.scale(), r)
                            )
                            $t.select('rect.tcontainer').attr('width', 100).attr('height', h)
                            $t.select('text.tflow').text(_ => r.arr.map(x => !!x ? 'W' : 'R').join('→'))
                            $t.select('text.tsize').text(_ => `${r.level} ${d3.format(',')(r.tcount)}`)
                            $t.select('text.tretention').text(_ => d3.format('0.1%')(
                                r.retention
                            ))
                        }

                    })
                })
            }

            $g.append('rect').attr('class', 'retained').call(showTooltip)
            .append('title')

            $g.append('rect').attr('class', 'dropped').call(showTooltip)

            $g.append('text').attr('class', 'label')
        })

        $rects.exit().remove()


        $rects
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .attr('fill', d => d.arr.length == 0 ? 'black' : d.arr.every(x => x == 0) ? '#3778c6' : d.arr.every(x => x == 1) ? '#e2f2fb' : '#845582')
            .select('rect.retained').attr('width', d => nodeWidth).attr('height', d => d.size)
            .select('title').text(d =>
                `${d.webs}\n${d.tcount}\n
                ${coWebsLens(findTreeByWebs(d.arr, tree))}
                ${coTcountLens(findTreeByWebs(d.arr, tree))}\n
                ${opWebsLens(findTreeByWebs(d.arr, tree))}
                ${opTcountLens(findTreeByWebs(d.arr, tree))}\n
                Retention: ${  d3.format('0.1%')(
                        d.retention
                    )
                }`
            )
        $rects
            .select('rect.dropped')
                .attr('width', d => nodeWidth)
                .attr('height', d => (1 - d.retention)  * d.size)
                .attr("y", d => d.arr[0] == 1 ? 0 : d.retention  * d.size)
                .attr('fill', d => d.arr.length == 0 ? 'black' : d.arr.every(x => x == 0) ? 'white' : d.arr.every(x => x == 1) ? 'black' : 'white')
                .style({
                    mask: 'url(#mask-stripe)'
                })
        $rects.select('text.label')
        //.attr('style', d => `font-size: ${15 / d.arr.length}px`)
        .attr('style', d => `font-size: ${Math.min(d.size, 15)}px`)
        .each(function(d) {
            return
            let size = Math.min(d.size, 15)
            if(true || zoomListener.scale() * size > 10) {
                const $t = d3.select(this)
                $t.text(d.arr.map(x => !!x ? 'W' : 'R').join('→'))
            }
        })



        const $paths = $main.selectAll('path.link').data(links)

        $paths.enter().append('path').attr('class', 'link')
            .attr("stroke", d => {
                return R.last(d.target.arr) == 1 ? 'rgba(226, 242, 251, 0.5)': 'rgba(55, 120, 198, 0.5)'
            })
            //.attr("stroke-opacity", 0.2)
            .attr("fill", "none")

        $paths
            .attr("d", link)
            .attr("stroke-width", d => d.target.size)

        $paths.exit().remove()

        $defs.selectAll('path.dlink').data(links)
          .enter().append('path')
          .attr('id', d => d.key)
          .attr('class', 'dlink').attr('d', link)



        // path lebels at right
        const $pathsLabels1 = $main.selectAll('text.pathsLabels').data(links)
        $pathsLabels1.enter().append('text').attr({
          'class': 'pathsLabels'
        })
        .append('textPath').attr({
          startOffset: '96%',
          'text-anchor': 'end',
          'alignment-baseline': 'middle',
          'xlink:href': d => '#' + d.key
        })
        .style({
          'font-size': d => 3 * ln(d.source.size + 1),
          fill: 'white'
        })
        .text(d => d3.format(',')(d.tcount))

        // path labels at left
        const $pathsLabels2 = $main.selectAll('text.pathsLabels2').data(links)
        $pathsLabels2.enter().append('text').attr({
          'class': 'pathsLabels2'
          , dy: d =>
            d.target.size > 5 ? 0 :
            R.head(d.target.arr) == 1 ?
              5 * ((d.target.type == 'op' ? -1 : 1) * d.target.size)
              :
              5 * ((d.target.type == 'co' ? -1 : 1) * d.target.size )
        })
        .append('textPath').attr({
          startOffset: '3%',
          'text-anchor': 'start',
          'alignment-baseline': 'middle',
          'xlink:href': d => '#' + d.key
        })
        .style({
          'font-size': d => 3 * ln(d.source.size + 1),
          fill: 'white'
        })
        .text(d => d3.format('%')(d.target.tcount / d.source.tcount))



        const $topMostLabels = $main.selectAll('g.topMostLabel').data(R.filter(x => x.level == 1, flatResult))
        $topMostLabels.enter().append('g').attr({'class': 'topMostLabel', 'transform': d => `translate(${d.x - 30}, ${d.y + d.size / 2}) `})
        .append('text').style({fill: 'white', 'font-size': d => 3 * ln(d.size + 1)}).attr({ 'transform': 'rotate(-90)', 'text-anchor': 'middle'}).text(d => d3.format(',')(d.tcount))
    }

    let tree = result

    // return json(view, tree)

    // add co, op type to each node
    tree = traverseBoth(co => R.merge(co, {type: 'co'}), op => R.merge(op, {type: 'op'}), tree)

    // return json(view, tree)

    // add level to each node
    tree = foldTree ((acc, tree) => R.merge(tree, {level: acc.level + 1}), {level: -1}, tree)

    // return json(view, tree)

    tree = findTreeByWebs([], tree)

    tree = traverse(d => R.merge(d, {
        retention: (coTcountLens(findTreeByWebs(d.arr, tree)) + opTcountLens(findTreeByWebs(d.arr, tree))) / d.tcount
    }), tree)

    // return json(view, tree)

    render(tree)
}
