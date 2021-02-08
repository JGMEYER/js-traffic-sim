/**
 * Directed, disconnected graph with positive integers as node identifiers.
 */
class Graph {
    constructor() {
        this.edges = {};  // source: [targets]
    }

    get nodes() {
        return Object.keys(this.edges).map(e => Number(e));
    }

    /**
     * Check if value is a positive integer.
     * @param {*} val
     * @param {string} name Name of value
     * @throws TypeError
     */
    _checkIsPositiveInteger(val, name) {
        if (!Number.isInteger(val) || val < 0) {
            throw new TypeError(`${name} must be a positive integer.`);
        }
    }

    /**
     * Add edge to graph, adding nodes if not already exists.
     * @param {number} source
     * @param {number} target
     */
    addEdge(source, target) {
        this._checkIsPositiveInteger(source, 'source');
        this._checkIsPositiveInteger(target, 'target');

        // Add nodes, if not already exist
        if (!this.edges.hasOwnProperty(source)) {
            this.edges[source] = [];
        }
        if (!this.edges.hasOwnProperty(target)) {
            this.edges[target] = [];
        }

        // Add edge, if not already exists
        if (!this.edges[source].includes(target)) {
            this.edges[source].push(target);
        }
    }

    /**
     * Remove edge from graph, removing orphaned nodes if any created.
     * @param {number} source
     * @param {number} target
     */
    removeEdge(source, target) {
        this._checkIsPositiveInteger(source, 'source');
        this._checkIsPositiveInteger(target, 'target');

        if (!this.edges.hasOwnProperty(source)) {
            return;
        }

        this.edges[source] = this.edges[source].filter(
            n => n !== target
        );

        // Remove orphaned nodes
        if (this.inDegree(source) === 0 && this.outDegree(source) === 0) {
            delete this.edges[source];
        }
        if (this.inDegree(target) === 0 && this.outDegree(target) === 0) {
            delete this.edges[target];
        }
    }

    /**
     * Remove node grom graph, removing all edges into and out of the node and
     * removing any orphaned nodes if any are created.
     * @param {number} source
     */
    removeNode(source) {
        this._checkIsPositiveInteger(source, 'source');

        if (!this.edges.hasOwnProperty(source)) {
            return;
        }

        // Remove node
        delete this.edges[source];

        // Remove references to node
        for (let key in this.edges) {
            key = Number(key);

            // Remove indegree edges to node
            const indexOf = this.edges[key].indexOf(source);
            if (indexOf > -1) {
                this.edges[key].splice(indexOf, 1);
            }

            // If node is now orphaned, remove
            if (this.inDegree(key) === 0 && this.outDegree(key) === 0) {
                delete this.edges[key]
            }
        }
    }

    /**
     * Computes number of incoming edges for specified node.
     * @param {number} source
     * @returns {number} inDegree
     */
    inDegree(source) {
        this._checkIsPositiveInteger(source, 'source');
        let inDegree = 0;
        Object.values(this.edges).forEach(e => {
            if (e.includes(source)) {
                inDegree++;
            }
        });
        return inDegree;
    }

    /**
     * Computes number of outgoing edges for specified node.
     * @param {number} source
     * @returns {number} outDegree
     */
    outDegree(source) {
        this._checkIsPositiveInteger(source, 'source');
        return this.edges[source].length;
    }

    /**
     * Get nodes adjacent to source, i.e for edges source->v, returns all v.
     * @param {number} source
     * @returns {Array<number>} Adjacent nodes
     */
    adjacent(source) {
        this._checkIsPositiveInteger(source, 'source');
        return this.edges[source];
    }

    /**
     * Get nodes along path from source. Does not include source.
     * @param {number} source
     * @returns {Set<number>} Nodes along path starting from source.
     */
    alongPath(source) {
        this._checkIsPositiveInteger(source, 'source');

        const nodesAlongPath = new Set();
        const visited = new Set();
        const stack = [...this.adjacent(source)];

        visited.add(source);

        // DFS
        while (stack.length > 0) {
            const curNode = stack.pop();
            if (visited.has(curNode)) {
                continue;
            }
            stack.push(...this.adjacent(curNode));
            nodesAlongPath.add(curNode);
            visited.add(curNode);
        }

        return nodesAlongPath;
    }

    /**
     * Use Djikstra's algorithm to find shortest path from source -> target.
     * Includes source node in path.
     * @param {number} source
     * @param {number} target
     * @throws Error if no path found
     */
    shortestPath(source, target) {
        this._checkIsPositiveInteger(source, 'source');
        this._checkIsPositiveInteger(target, 'target');

        const dist = {};
        const previous = {};
        let remaining = this.nodes;

        // Initialize distances
        remaining.forEach(e => {
            dist[e] = Infinity;
            previous[e] = null;
        });
        dist[source] = 0;

        // Calculate distances between nodes
        while (remaining.length > 0) {
            // Find node, u, with shortest distance
            let shortestDist = Infinity;
            let u = remaining[0];
            for (let idx = 0; idx < remaining.length; idx++) {
                const node = remaining[idx];
                if (dist[node] < shortestDist) {
                    u = node;
                    shortestDist = dist[node];
                }
            }

            // Update distances
            const adjacent = this.adjacent(u)
            adjacent.forEach(v => {
                const alt = dist[u] + 1;
                if (alt < dist[v]) {
                    dist[v] = alt;
                    previous[v] = u;
                }
            });

            // Remove u from remaining
            remaining = remaining.filter(e => e !== u);
        }

        // No path to target
        if (dist[target] === Infinity) {
            throw new Error(`No path from ${source} to ${target}.`);
        }

        // Build path
        const path = [];
        let curNode = target;
        while (curNode !== null) {
            path.unshift(curNode);
            curNode = previous[curNode];
        }
        return path;
    }

    /**
     * Serialize edges into array of objects.
     * @returns {Array<Object>} Serialized edges
     */
    serializeEdges() {
        const serializedEdges = []
        for (const key in this.edges) {
            const source = Number(key);
            serializedEdges.push(...this.edges[source].map(
                target => {
                    return {
                        source: source,
                        target: target,
                    }
                }
            ));
        }
        return serializedEdges;
    }
}

export default Graph;