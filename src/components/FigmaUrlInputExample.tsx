"use client";

import React, { useState } from "react";

/**
 * Exemplo de reconstrução de um componente de input de URL do Figma,
 * triangulando informações do AST e SVG do design.
 *
 * - Estrutura hierárquica e nomes vindos do AST
 * - Estilo e layout inspirados no SVG
 * - Estados: idle, focus, loading, success, error
 */

const STATUS = {
  IDLE: "idle",
  FOCUS: "focus",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

type Status = keyof typeof STATUS;

export default function FigmaUrlInputExample() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleFocus() {
    setStatus("FOCUS");
    setError(null);
  }

  function handleBlur() {
    if (!url) setStatus("IDLE");
    else setStatus("FOCUS");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("LOADING");
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Simulação de busca (substitua pela chamada real)
    setTimeout(() => {
      if (url.startsWith("https://www.figma.com/")) {
        setStatus("SUCCESS");
        setSuccess(true);
      } else {
        setStatus("ERROR");
        setError("URL inválida do Figma");
      }
      setLoading(false);
    }, 1200);
  }

  // Estilos dinâmicos inspirados no SVG e tokens do design system
  const inputBase =
    "w-full rounded px-3 py-2 border outline-none transition-colors text-sm font-mono bg-white";
  const borderColor =
    status === "ERROR"
      ? "border-red-500 focus:border-red-500"
      : status === "SUCCESS"
      ? "border-green-500 focus:border-green-500"
      : status === "FOCUS"
      ? "border-blue-600 focus:border-blue-700"
      : "border-gray-300 focus:border-blue-600";
  const ringColor =
    status === "FOCUS" ? "ring-2 ring-blue-200" : "ring-0";
  const disabled = loading;

  return (
    <form
      className="w-full max-w-md mx-auto flex flex-col gap-3 p-6 bg-white rounded-xl shadow border border-gray-100"
      onSubmit={handleSubmit}
    >
      <label htmlFor="figma-url" className="font-semibold text-xs text-gray-700 mb-1">
        URL do Figma
      </label>
      <div className="relative flex items-center">
        <input
          id="figma-url"
          type="text"
          className={`${inputBase} ${borderColor} ${ringColor} pr-10`}
          placeholder="Cole aqui a URL do arquivo Figma"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoComplete="off"
        />
        {/* Ícones de status */}
        <div className="absolute right-2 flex items-center h-full">
          {status === "LOADING" && (
            <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {status === "SUCCESS" && (
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === "ERROR" && (
            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      </div>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
      <button
        type="submit"
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 transition disabled:opacity-60 text-sm shadow"
        disabled={disabled || !url}
      >
        {loading ? "Buscando..." : "Buscar SVG"}
      </button>
      {success && (
        <div className="text-xs text-green-600 mt-2">SVG encontrado e pronto para visualização!</div>
      )}
    </form>
  );
}
