import 'zone.js/dist/zone';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.html',
  styleUrls: ['./main.scss'],
})
export class App {
  bigramas: Record<string, Record<string, number>> = {};
  sugestoes: string[] = [];

  abrir(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files === null) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const reader = new FileReader();
      reader.onload = (e) => this._acaoArquivoCarregado(e);
      reader.readAsText(file);
    }
  }

  digita(valor: string) {}

  sugerir(valor: string) {
    const palavra = `${obterPalavras(valor).pop()?.trim()}`;
    this.sugestoes = [];
    const bigrama = this.bigramas[palavra];
    if (bigrama === undefined) return;
    const ordenado = Object.entries(bigrama).sort((a, b) => b[1] - a[1]);
    this.sugestoes = ordenado.map((p) => p[0]);
  }

  private _acaoArquivoCarregado(evento: ProgressEvent<FileReader>) {
    if (evento.target === null) return;
    if (evento.target.result === null) return;
    const conversations = JSON.parse(
      `${evento.target.result}`
    ) as IConversations;
    for (const conversation of conversations) {
      for (const map of Object.values(conversation.mapping)) {
        if (map?.message?.content?.content_type === 'text') {
          const palavras = obterPalavras(
            `${map?.message?.content.parts?.join('\n')}`
          );
          for (let i = 0; i < palavras.length - 1; i++) {
            const palavra1 = palavras[i];
            const palavra2 = palavras[i + 1];
            if (!this.bigramas[palavra1]) {
              this.bigramas[palavra1] = {};
            }
            if (this.bigramas[palavra1][palavra2]) {
              this.bigramas[palavra1][palavra2]++;
            } else {
              this.bigramas[palavra1][palavra2] = 1;
            }
          }
        }
      }
    }
  }
}

bootstrapApplication(App);

type IConversations = IConversation[];
interface IConversation {
  mapping: Record<string, IMap>;
  title: string;
}
interface IMap {
  message: {
    content?: {
      content_type?: string;
      parts?: string[];
    };
  };
}

function obterPalavras(texto: string) {
  return texto
    .toLowerCase()
    .replace(/[^\wáéíóúãõâêîôûç]+/g, ' ')
    .split(/[\s\b\r\n]+/);
}
