import { Component, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {type CellStyle, Graph, InternalEvent} from '@maxgraph/core';
//import { mxGraph, mxGraphModel } from 'mxgraph';
//declare var mxGraph: any;
//declare var mxHierarchicalLayout: any;
// import factory, { mxGraph, mxGraphModel, mxHierarchicalLayout } from 'mxgraph';
//import mx from '../../../mxgraph';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CanvasComponent implements AfterViewInit {
  /**
   * Constructor
   */
  constructor() {
  }


  @ViewChild("graphContainer") containerElementRef: ElementRef;

  get container() {
    return this.containerElementRef.nativeElement;
  }

  ngAfterViewInit(): void {


    /*const graph: mxGraph = new mx.mxGraph(this.container);
    const model: mxGraphModel = graph.getModel();
    model.beginUpdate();
    try {
      graph.insertVertex(graph.getDefaultParent(), '', 'TEST', 0, 0, 100, 100);
    } finally {
      model.endUpdate();
    }*/


    // Disables the built-in context menu
    InternalEvent.disableContextMenu(this.container);

    const graph = new Graph(this.container);
    graph.setPanning(true); // Use mouse right button for panning
    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    const parent = graph.getDefaultParent();

    // Adds cells to the model in a single step
    graph.batchUpdate(() => {
      const vertex01 = graph.insertVertex(parent, null, 'a regular rectangle', 10, 10, 100, 100);
      const vertex02 = graph.insertVertex(parent, null, 'a regular ellipse', 350, 90, 50, 50, <CellStyle>{ shape: 'ellipse', fillColor: 'orange' });
      graph.insertEdge(parent, null, 'a regular edge', vertex01, vertex02);
    });
/*
    const graph = new mxGraph(this.container.nativeElement);
    try {
      const parent = graph.getDefaultParent();
      graph.getModel().beginUpdate();
      //Creating Shapes
      const vertex1 = graph.insertVertex(parent, null, 'Vertex 1', 0, 0, 200, 80);
      const vertex2 = graph.insertVertex(parent, null, 'Vertex 2', 0, 0, 200, 80);
      const vertex3 = graph.insertVertex(parent, null, 'Vertex 3', 0, 0, 200, 80);
      const vertex4 = graph.insertVertex(parent, null, 'Vertex 4', 100, 100, 400, 150,"shape=ellipse");
      //Creating parent child realtionship
      graph.insertEdge(parent, null, null, vertex1, vertex2);
      graph.insertEdge(parent, null, null,  vertex1, vertex3);
      graph.insertEdge(parent, null, null,  vertex3, vertex4);
    } finally {
      graph.getModel().endUpdate();
      new mxHierarchicalLayout(graph).execute(graph.getDefaultParent());
    }*/

  }

}
