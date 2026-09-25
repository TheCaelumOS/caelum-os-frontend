'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  checkLocalConnectorHealth,
  getLocalPairingToken,
  setLocalPairingToken,
  LocalConnectorHealth,
} from '../lib/localConnector';

export interface UseLocalInfrastructureResult {
  connectorConnected: boolean;
  dockerConnected: boolean;
  kubernetesConnected: boolean;
  dockerVersion: string;
  dockerEngine: string;
  kubernetesContext: string;
  kubernetesVersion: string;
  platform: string;
  loading: boolean;
  pairingToken: string;
  setPairingToken: (token: string) => void;
  refresh: () => Promise<void>;
}

export function useLocalInfrastructure(): UseLocalInfrastructureResult {
  const [connectorConnected, setConnectorConnected] = useState<boolean>(false);
  const [dockerConnected, setDockerConnected] = useState<boolean>(false);
  const [kubernetesConnected, setKubernetesConnected] = useState<boolean>(false);
  const [dockerVersion, setDockerVersion] = useState<string>('');
  const [dockerEngine, setDockerEngine] = useState<string>('');
  const [kubernetesContext, setKubernetesContext] = useState<string>('');
  const [kubernetesVersion, setKubernetesVersion] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [pairingToken, setPairingTokenState] = useState<string>('');

  const updateToken = useCallback((token: string) => {
    setLocalPairingToken(token);
    setPairingTokenState(token);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const storedToken = getLocalPairingToken();
    setPairingTokenState(storedToken);

    try {
      const health = await checkLocalConnectorHealth();
      if (health && health.status === 'ok') {
        setConnectorConnected(true);
        setDockerConnected(Boolean(health.docker));
        setDockerVersion(health.dockerVersion || '');
        setDockerEngine(health.dockerEngine || 'Docker Desktop');
        setKubernetesConnected(Boolean(health.kubernetes));
        setKubernetesContext(health.kubernetesContext || '');
        setKubernetesVersion(health.kubernetesVersion || '');
        setPlatform(health.platform || 'windows');
      } else {
        setConnectorConnected(false);
        setDockerConnected(false);
        setKubernetesConnected(false);
        setDockerVersion('');
        setKubernetesContext('');
      }
    } catch {
      setConnectorConnected(false);
      setDockerConnected(false);
      setKubernetesConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // Poll connector status every 10 seconds
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    connectorConnected,
    dockerConnected,
    kubernetesConnected,
    dockerVersion,
    dockerEngine,
    kubernetesContext,
    kubernetesVersion,
    platform,
    loading,
    pairingToken,
    setPairingToken: updateToken,
    refresh,
  };
}
