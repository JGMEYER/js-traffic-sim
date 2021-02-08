import Graph from './Graph';

describe('Graph', () => {
    describe('_checkIsPositiveInteger', () => {
        test('with valid integer', () => {
            const input = 3;
            const graph = new Graph();
            expect(() => graph._checkIsPositiveInteger(input)).not.toThrow();
        });
        test('with negative integer', () => {
            const input = -3;
            const graph = new Graph();
            expect(() => graph._checkIsPositiveInteger(input)).toThrow();
        });
        test('with string', () => {
            const input = '3';
            const graph = new Graph();
            expect(() => graph._checkIsPositiveInteger(input)).toThrow();
        });
    })

    describe('addEdge', () => {
        test('edges are added correctly', () => {
            const graph = new Graph();

            // Add two new nodes
            graph.addEdge(0, 1);
            expect(graph.edges).toEqual({ 0: [1], 1: [] });

            // Add one new node
            graph.addEdge(1, 2);
            expect(graph.edges).toEqual({ 0: [1], 1: [2], 2: [] });

            // Connect to existing node
            graph.addEdge(2, 0);
            expect(graph.edges).toEqual({ 0: [1], 1: [2], 2: [0] });

            // Connect to more than one node
            graph.addEdge(1, 3);
            expect(graph.edges).toEqual({ 0: [1], 1: [2, 3], 2: [0], 3: [] });
        });
        test('can handle complex graphs', () => {
            // Visual representation at: http://i.stack.imgur.com/7C2kD.png
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(1, 3);
            graph.addEdge(1, 4);
            graph.addEdge(2, 3);
            graph.addEdge(2, 4);
            graph.addEdge(3, 0);
            graph.addEdge(3, 4);
            graph.addEdge(4, 5);
            graph.addEdge(6, 3);

            expect(graph.edges).toEqual(
                {
                    0: [1],
                    1: [2, 3, 4],
                    2: [3, 4],
                    3: [0, 4],
                    4: [5],
                    5: [],
                    6: [3],
                }
            );
        });
        test('same edge cannot be added twice', () => {
            const graph = new Graph();

            graph.addEdge(0, 1);
            expect(graph.edges).toEqual({ 0: [1], 1: [] });

            graph.addEdge(0, 1);
            expect(graph.edges).toEqual({ 0: [1], 1: [] });
        });
    });

    describe('removeEdge', () => {
        test('edges are removed correctly', () => {
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(1, 3);
            graph.addEdge(2, 0);
            graph.addEdge(4, 0);

            // Remove edge without disconnecting graph
            graph.removeEdge(1, 2);
            expect(graph.edges).toEqual({ 0: [1], 1: [3], 2: [0], 3: [], 4: [0] });

            // Remove edge from starting node, i.e. create orphaned node
            graph.removeEdge(2, 0);
            expect(graph.edges).toEqual({ 0: [1], 1: [3], 3: [], 4: [0] });

            // Remove edge to create disconnected graph
            graph.removeEdge(0, 1);
            expect(graph.edges).toEqual({ 0: [], 1: [3], 3: [], 4: [0] });

            // Remove edge to remove one of disconnected graphs, i.e. create 2
            // orphaned nodes.
            graph.removeEdge(1, 3);
            expect(graph.edges).toEqual({ 0: [], 4: [0] });
        });
    });

    describe('removeNode', () => {
        test('nodes are removed correctly', () => {
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(1, 3);
            graph.addEdge(2, 0);
            graph.addEdge(4, 0);

            graph.removeNode(3);
            expect(graph.edges).toEqual({ 0: [1], 1: [2], 2: [0], 4: [0] });

            graph.removeNode(2);
            expect(graph.edges).toEqual({ 0: [1], 1: [], 4: [0] });

            graph.removeNode(0);
            expect(graph.edges).toEqual({});
        });
    });

    describe('inDegree', () => {
        test('can handle complex graphs', () => {
            // Visual representation at: http://i.stack.imgur.com/7C2kD.png
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(1, 3);
            graph.addEdge(1, 4);
            graph.addEdge(2, 3);
            graph.addEdge(2, 4);
            graph.addEdge(3, 0);
            graph.addEdge(3, 4);
            graph.addEdge(4, 5);
            graph.addEdge(6, 3);

            expect(graph.inDegree(0)).toEqual(1);
            expect(graph.inDegree(1)).toEqual(1);
            expect(graph.inDegree(2)).toEqual(1);
            expect(graph.inDegree(3)).toEqual(3);
            expect(graph.inDegree(4)).toEqual(3);
            expect(graph.inDegree(5)).toEqual(1);
            expect(graph.inDegree(6)).toEqual(0);
        });
    });

    describe('outDegree', () => {
        test('can handle complex graphs', () => {
            // Visual representation at: http://i.stack.imgur.com/7C2kD.png
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(1, 3);
            graph.addEdge(1, 4);
            graph.addEdge(2, 3);
            graph.addEdge(2, 4);
            graph.addEdge(3, 0);
            graph.addEdge(3, 4);
            graph.addEdge(4, 5);
            graph.addEdge(6, 3);

            expect(graph.outDegree(0)).toEqual(1);
            expect(graph.outDegree(1)).toEqual(3);
            expect(graph.outDegree(2)).toEqual(2);
            expect(graph.outDegree(3)).toEqual(2);
            expect(graph.outDegree(4)).toEqual(1);
            expect(graph.outDegree(5)).toEqual(0);
            expect(graph.outDegree(6)).toEqual(1);
        });
    });

    describe('adjacent', () => {
        test('can handle complex graphs', () => {
            // Visual representation at: http://i.stack.imgur.com/7C2kD.png
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(1, 3);
            graph.addEdge(1, 4);
            graph.addEdge(2, 3);
            graph.addEdge(2, 4);
            graph.addEdge(3, 0);
            graph.addEdge(3, 4);
            graph.addEdge(4, 5);
            graph.addEdge(6, 3);

            expect(graph.adjacent(0)).toEqual([1]);
            expect(graph.adjacent(1)).toEqual([2, 3, 4]);
            expect(graph.adjacent(2)).toEqual([3, 4]);
            expect(graph.adjacent(3)).toEqual([0, 4]);
            expect(graph.adjacent(4)).toEqual([5]);
            expect(graph.adjacent(5)).toEqual([]);
            expect(graph.adjacent(6)).toEqual([3]);
        });
    });

    describe('alongPath', () => {
        test('can handle complex graphs', () => {
            // Visual representation at: http://i.stack.imgur.com/7C2kD.png
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(1, 3);
            graph.addEdge(1, 4);
            graph.addEdge(2, 3);
            graph.addEdge(2, 4);
            graph.addEdge(3, 0);
            graph.addEdge(3, 4);
            graph.addEdge(4, 5);
            graph.addEdge(6, 3);

            expect(graph.alongPath(0)).toEqual(new Set([1, 2, 3, 4, 5]));
            expect(graph.alongPath(1)).toEqual(new Set([0, 2, 3, 4, 5]));
            expect(graph.alongPath(2)).toEqual(new Set([0, 1, 3, 4, 5]));
            expect(graph.alongPath(3)).toEqual(new Set([0, 1, 2, 4, 5]));
            expect(graph.alongPath(4)).toEqual(new Set([5]));
            expect(graph.alongPath(5)).toEqual(new Set([]));
            expect(graph.alongPath(6)).toEqual(new Set([0, 1, 2, 3, 4, 5]));
        });
        test('can handle disconnected graphs', () => {
            // Visual representation at:
            // https://www.farfromready.com/wp-content/uploads/2019/01/directeddisconnectedgraph.jpg
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(0, 3);
            graph.addEdge(1, 0);
            graph.addEdge(1, 2);
            graph.addEdge(3, 2);
            graph.addEdge(4, 6);
            graph.addEdge(5, 6);

            expect(graph.alongPath(0)).toEqual(new Set([1, 2, 3]));
            expect(graph.alongPath(1)).toEqual(new Set([0, 2, 3]));
            expect(graph.alongPath(2)).toEqual(new Set());
            expect(graph.alongPath(3)).toEqual(new Set([2]));
            expect(graph.alongPath(4)).toEqual(new Set([6]));
            expect(graph.alongPath(5)).toEqual(new Set([6]));
            expect(graph.alongPath(6)).toEqual(new Set());
        });
    });

    describe('shortestPath', () => {
        test('can find all shortest paths from 0', () => {
            // Visual representation at: http://i.stack.imgur.com/7C2kD.png
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(1, 3);
            graph.addEdge(1, 4);
            graph.addEdge(2, 3);
            graph.addEdge(2, 4);
            graph.addEdge(3, 0);
            graph.addEdge(3, 4);
            graph.addEdge(4, 5);
            graph.addEdge(6, 3);

            expect(graph.shortestPath(0, 1)).toEqual([0, 1]);
            expect(graph.shortestPath(0, 2)).toEqual([0, 1, 2]);
            expect(graph.shortestPath(0, 3)).toEqual([0, 1, 3]);
            expect(graph.shortestPath(0, 4)).toEqual([0, 1, 4]);
            expect(graph.shortestPath(0, 5)).toEqual([0, 1, 4, 5]);
            expect(() => graph.shortestPath(0, 6)).toThrow();
        });
    });

    describe('serializeEdges', () => {
        test('can be serialized', () => {
            // Visual representation at: http://i.stack.imgur.com/7C2kD.png
            const graph = new Graph();
            graph.addEdge(0, 1);
            graph.addEdge(1, 2);
            graph.addEdge(1, 3);
            graph.addEdge(1, 4);
            graph.addEdge(2, 3);
            graph.addEdge(2, 4);
            graph.addEdge(3, 0);
            graph.addEdge(3, 4);
            graph.addEdge(4, 5);
            graph.addEdge(6, 3);

            expect(graph.serializeEdges()).toEqual([
                { source: 0, target: 1 },
                { source: 1, target: 2 },
                { source: 1, target: 3 },
                { source: 1, target: 4 },
                { source: 2, target: 3 },
                { source: 2, target: 4 },
                { source: 3, target: 0 },
                { source: 3, target: 4 },
                { source: 4, target: 5 },
                { source: 6, target: 3 },
            ]);
        });
    });
});