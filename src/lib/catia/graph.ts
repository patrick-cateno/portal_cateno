import { StateGraph, END } from '@langchain/langgraph';
import { GraphState, type GraphStateType } from './state';
import { intentNode } from './nodes/intent';
import { orchestratorNode } from './nodes/orchestrator';
import { searchNode } from './nodes/search';
import { toolCallerNode } from './nodes/tool-caller';
import { docProcessorNode } from './nodes/doc-processor';
import { responderNode } from './nodes/responder';

function routeByIntent(state: GraphStateType): string {
  switch (state.intent) {
    case 'search_apps':
    case 'get_status':
    case 'navigate':
      return 'search';
    case 'business_op':
      return 'toolCaller';
    case 'process_doc':
      return 'docProcessor';
    default:
      return 'responder';
  }
}

export function buildGraph() {
  const graph = new StateGraph(GraphState)
    .addNode('intent', intentNode)
    .addNode('orchestrator', orchestratorNode)
    .addNode('search', searchNode)
    .addNode('toolCaller', toolCallerNode)
    .addNode('docProcessor', docProcessorNode)
    .addNode('responder', responderNode)
    .addEdge('__start__', 'intent')
    .addEdge('intent', 'orchestrator')
    .addConditionalEdges('orchestrator', routeByIntent)
    .addEdge('search', 'responder')
    .addEdge('toolCaller', 'responder')
    .addEdge('docProcessor', 'responder')
    .addEdge('responder', END);

  return graph.compile();
}

let compiledGraph: ReturnType<typeof buildGraph> | null = null;

export function getGraph() {
  if (!compiledGraph) {
    compiledGraph = buildGraph();
  }
  return compiledGraph;
}
