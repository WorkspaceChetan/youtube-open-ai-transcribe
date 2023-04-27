import Container from "@mui/material/Container";
import Head from "next/head";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { LoadingButton } from "@mui/lab";
import { TextField, Typography, Alert } from "@mui/material";
import { FormEvent, useCallback, useRef, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const [output, setOutput] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();

  const transcribeData = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoader(true);
      setError("");

      let res: Response | null = null;
      try {
        res = await fetch("api/transcribe", {
          method: "POST",
          body: JSON.stringify({ url, openAiKey }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (err: any) {
        setError(err.message);
      }

      if (res!.ok) {
        const result = await res!.json();
        if (result.isError) {
          setError(result.errorMessage);
        } else {
          if (textAreaRef.current) {
            textAreaRef.current.value = result.text;
            textAreaRef.current.focus();
          }
        }
      } else setError(res!.statusText);

      setLoader(false);
    },
    [url, openAiKey, setLoader, setError]
  );

  return (
    <>
      <Head>
        <title>Transcribe Youtube Video</title>
      </Head>
      <Container style={{ minHeight: "calc(100vh - 56px)" }}>
        <Box sx={{ display: "block", pt: 2 }}>
          <Paper elevation={12} sx={{ p: 3.5 }}>
            <Box component="form" onSubmit={(e) => transcribeData(e)}>
              <Typography variant="h6" sx={{ pb: 3 }}>
                Enter your youtube URL
              </Typography>
              {error.length > 0 && (
                <Alert sx={{ mb: 2 }} severity="error">
                  {error}
                </Alert>
              )}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <TextField
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={(e) => setUrl(e.target.value)}
                  value={url}
                  id="youtube-url"
                  label="Youtube URL"
                  variant="outlined"
                  sx={{ width: "100%", pb: 2 }}
                  required
                />
                <TextField
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  onBlur={(e) => setOpenAiKey(e.target.value)}
                  value={openAiKey}
                  id="open-ai-key"
                  label="Open AI Key"
                  variant="outlined"
                  sx={{ width: "100%", pb: 3 }}
                  required
                />
                <LoadingButton
                  loading={loader}
                  type="submit"
                  size="large"
                  variant="outlined"
                >
                  Transcribe
                </LoadingButton>
              </Box>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ display: "block", pt: "48px" }}>
          <TextField
            id="outlined-multiline-static"
            placeholder="Text From Open AI"
            multiline
            rows={18}
            defaultValue=""
            inputRef={textAreaRef}
            sx={{ width: "100%" }}
            disabled={true}
          />
        </Box>
      </Container>
    </>
  );
}
