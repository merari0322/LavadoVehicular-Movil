/// <reference types="jest" />
import eas from '../../../eas.json';
import { assertReleaseApiUrls } from './config';

const AZURE = 'https://lavarapidovehicular.northcentralus.cloudapp.azure.com/api/v1';

describe('dirección del backend en los builds (MOV-08)', () => {
  it('un build de producción con http, localhost o el emulador falla con un mensaje claro', () => {
    expect(() => assertReleaseApiUrls(['http://10.0.2.2:8080/api/v1'], false)).toThrow(/EXPO_PUBLIC_API_URL/);
    expect(() => assertReleaseApiUrls(['https://localhost/api/v1'], false)).toThrow(/https y pública/);
    expect(() => assertReleaseApiUrls([AZURE, 'http://192.168.1.5:3003/api/v1'], false)).toThrow(/192\.168\.1\.5/);
    expect(() => assertReleaseApiUrls([AZURE], false)).not.toThrow();
  });

  it('en desarrollo se permite la IP del computador por http', () => {
    expect(() => assertReleaseApiUrls(['http://192.168.1.5:8080/api/v1'], true)).not.toThrow();
  });

  it('el perfil production de EAS usa la misma URL https y el mismo canal que preview', () => {
    expect(eas.build.production.env.EXPO_PUBLIC_API_URL).toBe(eas.build.preview.env.EXPO_PUBLIC_API_URL);
    expect(eas.build.production.env.EXPO_PUBLIC_API_URL).toMatch(/^https:\/\//);
    expect(eas.build.production.channel).toBe(eas.build.preview.channel);
  });
});
