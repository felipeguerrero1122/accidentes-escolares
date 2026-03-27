import { NextResponse } from "next/server";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created(data: unknown) {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string, issues?: unknown) {
  return NextResponse.json({ error: message, issues }, { status: 400 });
}

export function unauthorized(message = "No autorizado.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "No permitido.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "No encontrado.") {
  return NextResponse.json({ error: message }, { status: 404 });
}
