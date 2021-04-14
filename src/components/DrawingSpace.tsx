import { Button } from 'antd';
import ButtonGroup from 'antd/lib/button/button-group';
import { useRef, MouseEvent, useEffect, useState } from 'react';

class Path {
    public _color: string;
    public _points: Array<Array<Number>> = [];

    constructor(color: string) {
        this._color = color;
    }

    addPoint(point: Array<number>) {
        this._points.push(point);
    }
}

class Point {
    public x: number;
    public y: number;

    constructor(_x: number, _y: number) {
        this.x = _x;
        this.y = _y;
    }

    add(point: Point): Point {
        return new Point(point.x + this.x, point.y + this.y);
    }

    divide(number: number): Point {
        return new Point(this.x / number, this.y / number);
    }

    distance(point: Point): number {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    }

    static sum(points: Array<Point>) {
        return points.reduce((sum, point) => {
            return sum.add(point);
        }, new Point(0, 0));
    }

    toArray(): [number, number] {
        return [this.x, this.y];
    }

    static centroid(points: Array<Point>) {
        const sum = this.sum(points);
        return sum.divide(points.length);
    }
}

class Shape {
    static isCircle(points: Array<Point>): [boolean, Point, number] {
        const centroid = Point.centroid(points);

        let distanceSum = 0;
        let distances = [];
        for (let i = 0; i < points.length; i++) {
            const distance = points[i].distance(centroid);
            distanceSum += distance;
            distances.push(distance);
        }
        const meanDistance = distanceSum / points.length;

        let stdDistanceSum = 0;
        for (let i = 0; i < distances.length; i++) {
            stdDistanceSum += Math.pow(distances[i] - meanDistance, 2);
        }
        const stdDistance = Math.sqrt((stdDistanceSum) / distances.length);

        return [stdDistance / meanDistance < 0.18, centroid, meanDistance];
    }
}

const DrawingSpace = () => {
    const [color, setColor] = useState('black');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseDown = useRef<boolean>(false);
    const points = useRef<Array<Point>>([]);
    const drewCircle = useRef<HTMLDivElement>(null);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    const handleResize = () => {
        const boundingRect = canvasRef.current?.getBoundingClientRect() ?? new DOMRect();

        if (!canvasRef.current) return;

        canvasRef.current.width = boundingRect.width;
        canvasRef.current.height = boundingRect.height;
    }

    const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
        if (!mouseDown.current) return;

        const { clientX, clientY } = event;
        const boundingRect = canvasRef.current?.getBoundingClientRect() ?? new DOMRect();

        if (points.current.length > 1) {
            const context = canvasRef.current?.getContext('2d');

            if (context) {
                context.lineTo(...points.current[points.current.length - 1].toArray())

                context.stroke();
            }
        }

        points.current.push(new Point(clientX - boundingRect.x, clientY - boundingRect.y));
    }

    const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
        mouseDown.current = true;

        const { clientX, clientY } = event;
        const boundingRect = canvasRef.current?.getBoundingClientRect() ?? new DOMRect();
        const position = new Point(clientX - boundingRect.x, clientY - boundingRect.y);
        points.current.push(position);

        const context = canvasRef.current?.getContext('2d');

        if (context) {
            context.beginPath();
            context.lineWidth = 10;
            context.strokeStyle = color;
            context.moveTo(...position.toArray());
        }
    }

    const handleMouseUp = () => {
        mouseDown.current = false;
        if (drewCircle.current) {
            const [isCircle, centroid, radius] = Shape.isCircle(points.current);
            drewCircle.current.innerHTML = isCircle ? "Thats a circle." : "That is not a circle.";
            if (isCircle) {
                const context = canvasRef.current?.getContext('2d');

                if (context) {
                    context.beginPath();
                    context.lineWidth = 10;
                    context.strokeStyle = 'orange';
                    context.arc(...centroid.toArray(), radius, 0, 2 * Math.PI, false);
                    context.stroke();
                }
            }
        }

        points.current = [];
    }

    const handleMouseOut = () => {
        points.current = [];
    }

    const colors = ['red', 'green', 'blue', 'black'];

    return (
        <>
            <ButtonGroup>
                {
                    colors.map(buttonColor => (
                        <Button key={buttonColor} onClick={() => setColor(buttonColor)} danger={color === buttonColor}>
                            <div style={{ width: 24, height: 24, backgroundColor: buttonColor }} />
                        </Button>
                    ))
                }
            </ButtonGroup>
            <div ref={drewCircle}>Nothing drewn yet!</div>
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseOut={handleMouseOut}
                onMouseUp={handleMouseUp}
                style={{ width: "100%", height: "100%" }}
            />
        </>
    )
}

export default DrawingSpace;