window.transformation = result => {

    const trace = (x, y) => {
        console.log(x)
        return y
    }

    const trace1 = x => trace(x, x)

    // http://goo.gl/vSZqZF
    const viewR = R.curry((arr, o) => arr.reduce(
        (acc, a) => ({
          o: acc.o == null ? null : R.view(acc.arr[0], acc.o),
          arr: R.drop(1, acc.arr)
        }),
        {o: o, arr: arr}
    ).o)

    const setR = R.curry((arr, v, o) => arr.map((a, j) => (j == arr.length - 1) ?  R.set(a, v) : R.set(a, {}))
        .reduce((acc, a) => a(acc), o))

    const sumUpTree = (f, view, set, tree) => {
        const setter = setR([R.lensProp('node'), set])
        const getter = viewR([R.lensProp('node'), view])
        const getterSetter = viewR([R.lensProp('node'), set])
        if(!tree) {
            return null
        } else {
            const {node, co, op} = tree
            const nco = sumUpTree(f, view, set, co)
            const nop = sumUpTree(f, view, set, op)

            const count = x => getterSetter(x) || getter(x) || 0

            return {
                node: R.set(set, f(R.view(view, node), count(nco), count(nop)), node),
                co: nco,
                op: nop
            }
        }
    }

    const foldTree = (f, seed, {node, co, op}) => {
        const nnode = f(seed, node)
        return ({
            node: nnode,
            co: !!co ? foldTree(f, nnode, co) : null,
            op: !!op ? foldTree(f, nnode, op) : null
        })
    }

    const traverse = R.curry((f, {node, co, op}) =>
        ({
            node: f(node),
            co: !!co ? traverse(f, co) : null,
            op: !!op ? traverse(f, op) : null
        })
    )


    const traverseBoth = R.curry((cof, opf, tree) => {

        const go = (f, {node, co, op}) =>
            ({
                node: f(node),
                co: !!co ? go(cof, co) : null,
                op: !!op ? go(opf, op) : null
            })

        return go(cof, tree)
    })

    const foldTreeToValue = (f, seed, tree) => {
        if(!tree){
            return seed
        }
        const {node, co, op} = tree
        const n = foldTreeToValue(f, f(seed, node))
        const c = foldTreeToValue(f, n, co)
        return foldTreeToValue(f, c, op)
    }

    const foldBoth = (cof, opf, seed, tree) => {
        const go = (f, seed, t) => {

            const {node, co, op} = t
            const nnode = f(seed, node)
            const nco = !!co ? go(cof, nnode, co) : null
            const nop = !!op ? go(opf(!!nco ? nco.node: null), nnode, op) : null
            return {
                node: nnode,
                co: nco,
                op: nop
            }
        }

        return go(cof, seed, tree)
    }

    const foldDownToList = (f, tree) => {
        if(!tree) {
            return []
        }
        const {node, co, op} = tree
        const nco = !!co ? [f(node, co.node)] : []
        const nop = !!op ? [f(node, op.node)] : []
        return nco.concat(nop).concat(foldDownToList(f, op)).concat(foldDownToList(f, co))
    }

    const foldDownBothToList = (cof, opf, tree) => {
        if(!tree) {
            return []
        }
        const {node, co, op} = tree

        //const nco = (!!co && !!op) ? [cof(node, co.node, op.node)] : []
        //const nop = (!!op && !!co) ? [opf(node, co.node, op.node)] : []

        const nco = !!co ? [cof(node, co.node, (!!op ? op.node : null))]  : []
        const nop = !!op ? [opf(node, (!!co ? co.node : null), op.node)] : []

        return nco.concat(nop).concat(foldDownBothToList(cof, opf, op)).concat(foldDownBothToList(cof, opf, co))
    }

    // findTreeByWebs([0, 1, 1, 1, 1], tree)
    const findTreeByWebs = (path, otree) => {
        const go = (path, tree) => {
            if(!tree) {
                return null
            }


            const {node, co, op} = tree
            if(path.length == otree.node.arr.length ) {
                return tree
            } else {
                const h = path[otree.node.arr.length]
                const s = R.last(node.arr)
                return go(R.drop(1, path), (h == s ? co : op))
            }
        }
        return path.length == 0 ? otree :
            otree.node.arr.length == 0
            ? go(R.drop(1, path), path[0] == 1 ? otree.op : otree.co)
            : go(path, otree)
    }

    const getBranchesAtLevel = (level, tree) => {
        const go = (v, tree) => {
            if(!tree) {
                return []
            }
            if(v == level) {
                return [tree]
            } else {
                return go(v+1, tree.co).concat(go(v+1, tree.op))
            }
        }
        return go(0, tree)
    }

    window.trace = trace
    window.trace1 = trace1
    window.foldTree = foldTree
    window.traverse = traverse
    window.traverseBoth = traverseBoth
    window.foldBoth = foldBoth
    window.foldTreeToValue = foldTreeToValue
    window.foldDownBothToList = foldDownBothToList
    window.findTreeByWebs = findTreeByWebs
    window.getBranchesAtLevel = getBranchesAtLevel


    // return result
    // return R.sum(result.map(x => x.count))

    result = resultresult = result.map(x => R.merge(x, {count: Math.round(+x.count)})).map(x => R.merge({arr: x.webs.split(',').map(y => parseInt(y))}, x))

    const makeTree = (list, tree) => {
        const children = list.filter(x => x.arr.length == tree.arr.length + 1 && x.webs.indexOf(tree.webs) == 0)
        return {
            node: tree,
            co: children.filter(x => (R.isEmpty(tree.arr) ? (x.webs == "0") : R.last(x.arr) == R.last(tree.arr)) ).map(c => makeTree(list, c))[0] || null,
            op: children.filter(x => (R.isEmpty(tree.arr) ? (x.webs == "1") : R.last(x.arr) != R.last(tree.arr)) ).map(c => makeTree(list, c))[0] || null

        }
    }

    //return makeTree(result, {arr: [], webs: "", count: 0})

    let tree = makeTree(result, {arr: [], webs: "", count: 0}) //.co

    tree = sumUpTree(
        (a, b, c) => a + b + c,
        R.lensProp('count'),
        R.lensProp('tcount'),
        tree
    )


    return tree
}
