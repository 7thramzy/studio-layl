ALTER TABLE public.tracks
  ADD COLUMN artist text NOT NULL DEFAULT 'استوديو ليل الأمسيات',
  ADD COLUMN versions text[] NOT NULL DEFAULT '{fx}',
  ADD COLUMN youtube_url text;

-- Replace the six demo works (only those without uploaded audio) with the studio's real catalogue.
DELETE FROM public.tracks WHERE audio_path IS NULL AND title IN ('ليلة العمر','فرحة أهل','يا أجمل حكاية','ليلة مختلفة','فرحة سنين','لحظة وصول');

INSERT INTO public.tracks (title, category, description, artist, versions, youtube_url, featured, sort_order) VALUES
('ليلة عمر — زفة سمو الشيخة نوف','زفات','زفة كوشة وملكة','استوديو ليل الأمسيات',ARRAY['fx','daf','full'],'https://www.youtube.com/watch?v=N2nvGNIbjGg',true,1),
('يا مرحبا ترحيبة العز والشان','شيلات','شيلة ترحيبية وعرضة سعودية','استوديو ليل الأمسيات',ARRAY['fx','daf','full'],'https://www.youtube.com/@studio-layl',false,2),
('أصدح يا صوت الفخر والمهابة','شيلات','شيلة زواج ومدح قبائل','استوديو ليل الأمسيات',ARRAY['daf','full','pure'],'https://www.youtube.com/@studio-layl',false,3),
('طلت سمو — مقدمة استعدادية 2027','زفات','زفة طلة عروس','استوديو ليل الأمسيات',ARRAY['fx','full'],'https://www.youtube.com/watch?v=gU_frH_T6y8',false,4),
('أقبلت','زفات','زفة طلة عروس','زينة عماد وعبدالمجيد عبدالله',ARRAY['fx','daf','full'],'https://www.youtube.com/watch?v=IKYvQuSgnIw',false,5),
('في حضورك','زفات','زفة كوشة وملكة','محمد عبده',ARRAY['fx','full'],'https://www.youtube.com/watch?v=t1KEn96hig4',false,6),
('جمال ما يوصف','زفات','زفة مسار عروس','راشد الماجد',ARRAY['fx','daf','full'],'https://www.youtube.com/watch?v=KVU5Ds0f4bw',false,7),
('تحرسك الأذكار','زفات','دخلة عروس','استوديو ليل الأمسيات',ARRAY['fx','pure'],'https://www.youtube.com/watch?v=uUtuWuHKd1I',false,8),
('عن جمالك','زفات','زفة كوشة وملكة','استوديو ليل الأمسيات',ARRAY['fx','daf','full'],'https://www.youtube.com/@studio-layl',false,9),
('عقد المحبة','زفات','زفة كوشة وملكة','استوديو ليل الأمسيات',ARRAY['fx','full'],'https://www.youtube.com/@studio-layl',false,10),
('لبيه','زفات','زفة عروس','استوديو ليل الأمسيات',ARRAY['daf','full'],'https://www.youtube.com/@studio-layl',false,11);
