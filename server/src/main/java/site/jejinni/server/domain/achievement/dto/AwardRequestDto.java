package site.jejinni.server.domain.achievement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AwardRequestDto {
	private String name;
	private LocalDate date;
	private String organization;
	private String tier;
	private Integer orderIndex;
}

