package site.jejinni.server.dto.project;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class ProjectContentDto {

	private UUID id;
	private UUID parentId;
	private Integer order;
	private String content;
	private UUID[] children;
}

